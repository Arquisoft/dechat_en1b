import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

import * as fileClient from 'solid-file-client';
import { element } from '@angular/core/src/render3/instructions';

@Injectable()
export class ChatService {

  isActive: BehaviorSubject<boolean>; // If the chat is Active (The client is chating with a contact)

  chatMessages: ChatMessage[] = new Array<ChatMessage>();

  thisUser: BehaviorSubject<User>;  // Current user that is using the chat
  currentUserWebId: string; // Current user's webID username

  otherUser: User; // Current user it's talking to

  friends: Array<User> = new Array<User>();

  /**
   * First it will try to get the session and then to load the current user in session data.
   * It will also load the user's friends.
   * @param rdf Service to access and manage all the actions with SOLID.
   * @param toastr To display error messages.
   */
  constructor(private rdf: RdfService, private toastr: ToastrService) {
    this.rdf.getSession();
    this.loadUserData().then(response => {
      this.loadFriends();
    });
    this.isActive = new BehaviorSubject<boolean>(false);
    this.thisUser = new BehaviorSubject<User>(null);
    setInterval(async () => {
      //await this.loadMessages();
    }, 15000);
  }

  // Observables

  /**
   * Returns current user in session as an Observable.
   */
  getUser() {
    return this.thisUser.asObservable();
  }

  /**
   * Returns the other user (as an Observable) whose talking with the current user in session.
   */
  getOtherUser() {
    return of(this.otherUser);
  }

  /**
   * Returns all the current user friends.
   */
  getUsers(): Observable<User[]> {
    return of(this.friends);
  }

  /**
   * Checks is there's a conversation opened.
   */
  isChatActive(): Observable<boolean> {
    return this.isActive.asObservable();
  }

  /**
   * Returns an observable of all the messages in a specific conversation.
   */
  getMessages(): Observable<ChatMessage[]> {
    return of(this.chatMessages);
  }

  // Loading methods

  /**
   * Waits for user to be in session, then finds its name, profile picture and webId to be used
   * in the application.
   */
  private async loadUserData() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    const webId = this.rdf.session.webId;
    const user: User = new User(webId, '', '');
    await this.rdf.getFieldAsStringFromProfile('fn').then(response => {
      user.username = response;
    });
    await this.rdf.getFieldAsStringFromProfile('hasPhoto').then(response => {
      user.profilePicture = response;
    });
    this.currentUserWebId = webId.split('/')[2].split('.')[0];
    this.thisUser.next(user);
  }

  /**
   * Load current user's friends with their names and profile pictures sorted by username.
   */
  private async loadFriends() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    (await this.rdf.getFriends()).forEach(async element => {
      await this.rdf.fetcher.load(element.value, {
        force: true, clearPreviousData: true
      });
      const photo: string = this.rdf.getValueFromVcard('hasPhoto', element.value) || '../assets/images/profile.png';
      this.friends.push(new User(element.value, this.rdf.getValueFromVcard('fn', element.value), photo));
      this.friends.sort(this.sortUserByName);
    });
  }

  /**
   * Load all messages from SOLID between the current user and the other user whose talking.
   */
  private async loadMessages() {
    console.log('Loading messages...');
    if (!this.isActive) {
      return;
    }
    await this.rdf.getSession();
    let msgBuffer: ChatMessage[] = new Array<ChatMessage>();
    await this.loadMessagesFromTo(this.otherUser, this.thisUser.value, msgBuffer);
    await this.loadMessagesFromTo(this.thisUser.value, this.otherUser, msgBuffer);
    //Add all messages
    this.chatMessages.length = 0;
    msgBuffer.forEach((msg) => {
      this.chatMessages.push(msg);
    });
    this.chatMessages.sort(this.sortByDateDesc);
  }

  /**
   * Auxiliary method to load messages with all their details (date, text, sender) between user1 and user2.
   * @param user1 First pair of the communication.
   * @param user2 Second pair of the communication.
   */
  private async loadMessagesFromTo(user1: User, user2: User, msgBuffer: ChatMessage[]) {
    //console.log('Loading messages from ' + user1.webId + ' to ' + user2.webId);
    const messages = (await this.rdf.getElementsFromContainer(await this.getChatUrl(user1, user2)));
    if (!messages) {
      this.toastr.error('Please make sure the other user has clicked on your chat', 'Could not load messages');
      this.isActive.next(false);
      this.chatMessages.length = 0;
      return;
    }
    await Promise.all(messages.map(async (message) => {
      msgBuffer.push(await this.getMsgFromRdf(message));
    }));
  }

  private async getMsgFromRdf(message) {
    const url = message.value + '#message';
    await this.rdf.fetcher.load(url, { force: true, clearPreviousData: true });
    const sender = this.rdf.getValueFromSchema('sender', url);
    const text = this.rdf.getValueFromSchema('text', url);
    const date = Date.parse(this.rdf.getValueFromSchema('dateSent', url));
    const name = await this.rdf.getFriendData(sender, 'fn');
    return new ChatMessage(name, text, date);
  }

  // Message methods

  /**
   * Gets the URL for the chat resource location.
   * @param user1 User who sends.
   * @param user2 User who receives.
   */
  public async getChatUrl(user1: User, user2: User): Promise<String> {
    await this.rdf.getSession();
    const root = user1.webId.replace('/profile/card#me', '/private/dechat/chat_');
    const name = user2.webId.split('/')[2].split('.')[0];
    // console.log(root + name + '/');
    return root + name + '/';
  }

  /**
   * Auxiliary comparator method to sort messages by their date.
   * @param m1 A message.
   * @param m2 Another message.
   */
  private sortByDateDesc = (m1: ChatMessage, m2: ChatMessage) => m1.timeSent > m2.timeSent ? 1 : m1.timeSent < m2.timeSent ? -1 : 0;

  /**
   * Auxiliary comparator method to sort users by their name.
   * @param u1 An user.
   * @param u2 Another user.
   */
  private sortUserByName = (u1: User, u2: User) => u1.username.localeCompare(u2.username);

  /**
   * Method to add a message to the ones present in the system.
   * @param message Message to be added.
   */
  public addMessage(message: ChatMessage) {
    this.chatMessages.push(message);
    this.chatMessages.sort(this.sortByDateDesc);
  }

  /**
   * Method to send a message to SOLID.
   * @param msg Text of the message to be sent.
   */
  async sendMessage(msg: string) {
    if (msg !== '' && this.otherUser) {
      const newMsg = new ChatMessage(this.thisUser.value.username, msg);
      this.addMessage(newMsg);
      this.postMessage(newMsg).then(() => this.loadMessages());
    }
  }

  /**
   * Method that declares the structure of the message in rdf and sends it to SOLID.
   * @param msg Instance of the message to be sent.
   */
  private async postMessage(msg: ChatMessage) {
    const message = `
    @prefix : <#>.
    @prefix schem: <http://schema.org/>.
    @prefix s: <${this.thisUser.value.webId.replace('#me', '#')}>.

    :message
      a schem:Message;
      schem:sender s:me;
      schem:text "${msg.message}";
      schem:dateSent "${msg.timeSent.toISOString()}".
    `;
    const path = await this.getChatUrl(this.thisUser.value, this.otherUser) + 'message.ttl';
    fileClient.createFile(path).then((fileCreated: any) => {
      fileClient.updateFile(fileCreated, message).then(() => {
        console.log('Message has been sent successfully');
      }, (err: any) => console.log(err));
    });
  }

  /**
   * Method invoked we switch to another conversation with a different user.
   * @param user The new user we are talking to.
   */
  async changeChat(user: User) {
    this.isActive.next(true);
    if (user === null) {
      console.log('Trying to change to chat with a null user!');
    } else {
      this.otherUser = user;
      this.checkFolderStructure().then(() => {
        this.loadMessages();
      });
    }
  }

  // Solid methods

  /**
   * Adds a friend to your SOLID profile given its webId.
   * @param webId Of the user that we are adding.
   */
  addFriend(webId: string) {
    if (this.thisUser.value.webId !== webId) {
      this.rdf.addFriend(webId);
    }
  }

  /**
   * Removes a friend to your SOLID profile given its webId and deletes all the stored conversations.
   * @param webId Of the user that we are removing.
   */
  removeFriend(webId: string) {
    // const name = webId.split('/')[2].split('.')[0];
    if (this.thisUser.value.webId !== webId) {
      this.rdf.removeFriend(webId);
      this.getChatUrl(this.thisUser.value, new User(webId, '', '')).then(response => {
        this.removeFolderStructure(response.toString());
      });
    }
  }

  removeMsg(msg : ChatMessage) {
    console.log("Deleting " + msg);
  }

  /**
   * Removes the conversation (its folder structure in the application) with a user
   * given a path.
   * @param path Of the folder to be deleted.
   */
  private async removeFolderStructure(path: string) {
    fileClient.deleteFolder(path).then(() => {
      console.log(`Removed folder ${path}.`);
    }, (err: any) => console.log(err));
  }

  /**
   * Method that evaluates if its possible to chat with another user (it has the correct folder
   * structure) and if it's not possible it will create the appropriate folder structure and give
   * the permissions.
   */
  async checkFolderStructure() {
    await this.rdf.getSession();
    try {
      this.getChatUrl(this.thisUser.value, this.otherUser).then(charUrl => {
        fileClient.readFolder(charUrl).then(() => {
          console.log('Folder structure correct');
        }, () => {
          console.log('Attempting to create: ' + charUrl);
          this.createFolderStructure(charUrl).then(() => {
            console.log('Creating ACL file...');
            this.grantAccessToFolder(charUrl, this.otherUser);
          });
        });
      });
    } catch (error) {
      console.log(`Error creating folder structure/with permissions: ${error}`);
    }
  }

  /**
   * Auxiliary method to create a folder structure given its path.
   * It should create the folders one by one.
   * @param path To the folder to be created.
   */
  private async createFolderStructure(path: String) {
    const root = this.thisUser.value.webId.replace('/profile/card#me', '/');
    await fileClient.createFolder(root + 'private/').then(() => {
      fileClient.createFolder(root + 'private/dechat/').then(() => {
        fileClient.createFolder(path).then(() => {
          console.log('Folder structure created');
        }, (err: string) => console.log('Could not create folder structure: ' + err));
      }, (err: string) => console.log('Could not create folder structure: ' + err));
    }, (err: string) => console.log('Could not create folder structure: ' + err));
  }

  /**
   * Method that creates the ACL structure to grant VIEW permissions to a user to a folder.
   * @param path To the folder whose permissions we are going to modify.
   * @param user To grant permissions.
   */
  private async grantAccessToFolder(path: string | String, user: User) {
    const webId = user.webId.replace('#me', '#');
    const acl =
      `@prefix : <#>.
        @prefix n0: <http://www.w3.org/ns/auth/acl#>.
        @prefix ch: <./>.
        @prefix c: </profile/card#>.
        @prefix c0: <${webId}>.

        :ControlReadWrite
            a n0:Authorization;
            n0:accessTo ch:;
            n0:agent c:me;
            n0:defaultForNew ch:;
            n0:mode n0:Control, n0:Read, n0:Write.
        :Read
            a n0:Authorization;
            n0:accessTo ch:;
            n0:agent c0:me;
            n0:defaultForNew ch:;
            n0:mode n0:Read.`;
    path += '.acl';
    console.log(path);
    console.log(acl);
    await fileClient.updateFile(path, acl).then(() => {
      console.log('Folder permisions added');
    }, (err: string) => console.log('Could not set folder permisions' + err));
  }
}
