import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

import * as fileClient from 'solid-file-client';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable()
export class ChatService {

  isActive: BehaviorSubject<boolean>; // If the chat is Active (The client is chating with a contact)

  chatMessages: ChatMessage[] = new Array<ChatMessage>();

  thisUser: BehaviorSubject<User>;  // Current user that is using the chat
  currentUserWebId: string; // Current user's webID username

  otherUser: User; // Current user it's talking to

  friends: Array<User> = new Array<User>();

  constructor(private rdf: RdfService, private toastr: ToastrService) {
    this.rdf.getSession();
    this.loadUserData().then(response => {
      this.loadFriends();
    });
    this.isActive = new BehaviorSubject<boolean>(false);
    this.thisUser = new BehaviorSubject<User>(null);
  }

  // Observables

  getUser() {
    return this.thisUser.asObservable();
  }

  getOtherUser() {
    return of(this.otherUser);
  }

  getUsers(): Observable<User[]> {
    return of(this.friends);
  }

  isChatActive(): Observable<boolean> {
    return this.isActive.asObservable();
  }

  getMessages(): Observable<ChatMessage[]> {
    return of(this.chatMessages);
  }

  // Loading methods

  private async loadUserData() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    const webId = this.rdf.session.webId;
    let user : User = new User(webId, '', '');
    await this.rdf.getFieldAsStringFromProfile('fn').then(response => {
      user.username = response;
    });
    await this.rdf.getFieldAsStringFromProfile('hasPhoto').then(response => {
      user.profilePicture = response;
    });
    this.currentUserWebId = webId.split('/')[2].split('.')[0];
    this.thisUser.next(user);
  }

  private async loadFriends() {
    await this.rdf.getSession();
    if (!this.rdf.session) {
      return;
    }
    (await this.rdf.getFriends()).forEach(async element => {
      await this.rdf.fetcher.load(element.value);
      const photo: string = this.rdf.getValueFromVcard('hasPhoto', element.value) || '../assets/images/profile.png';
      this.friends.push(new User(element.value, this.rdf.getValueFromVcard('fn', element.value), photo));
      this.friends.sort(this.sortUserByName);
    });
  }

  private async loadMessages() {
    console.log('Loading messages...');
    if (!this.isActive) {
      return;
    }
    await this.rdf.getSession();
    this.chatMessages.length = 0;
    this.loadMessagesFromTo(this.otherUser, this.thisUser.value);
    this.loadMessagesFromTo(this.thisUser.value, this.otherUser);
  }

  private async loadMessagesFromTo(user1: User, user2: User) {
    const messages = (await this.rdf.getElementsFromContainer(await this.getChatUrl(user1, user2)))
    if (!messages) {
      this.toastr.error('Please make sure the other user has clicked on your chat', 'Could not load messages');
      this.isActive.next(false);
      this.chatMessages.length = 0;
      return;
    }
    messages.forEach(async element => {
      const url = element.value + '#message';
      await this.rdf.fetcher.load(url);
      const sender = this.rdf.getValueFromSchema('sender', url);
      const text = this.rdf.getValueFromSchema('text', url);
      const date = Date.parse(this.rdf.getValueFromSchema('dateSent', url));
      const name = await this.rdf.getFriendData(sender, 'fn');
      //console.log('Messages loaded: ' + messages);
      this.addMessage(new ChatMessage(name, text, date));
    });
  }

  // Message methods

  /**
   * Gets the URL for the chat resource location
   * @param user1 user who sends
   * @param user2 user who recieves
   */
  private async getChatUrl(user1: User, user2: User): Promise<String> {
    await this.rdf.getSession();
    const root = user1.webId.replace('/profile/card#me', '/private/dechat/chat_');
    const name = user2.webId.split('/')[2].split('.')[0];
    const finalUrl = root + name + '/';
    // console.log(finalUrl);
    return finalUrl;
  }

  private sortByDateDesc(m1: ChatMessage, m2: ChatMessage) {
    return m1.timeSent > m2.timeSent ? 1 : m1.timeSent < m2.timeSent ? -1 : 0;
  }

  private sortUserByName(u1: User, u2: User) {
    return u1.username.localeCompare(u2.username);
  }

  private addMessage(message: ChatMessage) {
    this.chatMessages.push(message);
    this.chatMessages.sort(this.sortByDateDesc);
  }

  async sendMessage(msg: string) {
    if (msg !== '' && this.otherUser) {
      const newMsg = new ChatMessage(this.thisUser.value.username, msg);
      this.addMessage(newMsg);
      this.postMessage(newMsg).then(res => this.loadMessages());
    }
  }

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
      fileClient.updateFile(fileCreated, message).then( success => {
        console.log('Message has been sended succesfully');
      }, (err: any) => console.log(err) );
    });
  }

  async changeChat(user: User) {
    this.isActive.next(true);
    this.otherUser = user;
    this.checkFolderStructure().then(response => {
      this.loadMessages();
    });
  }

  // Solid methods

  addFriend(webId: string) {
    if (this.thisUser.value.webId !== webId) {
      this.rdf.addFriend(webId);
    }
  }

  removeFriend(webId: string) {
    const name = webId.split('/')[2].split('.')[0];
    if (this.thisUser.value.webId !== webId) {
      this.rdf.removeFriend(webId);
      this.getChatUrl(this.thisUser.value, new User(webId, '', '')).then(response => {
        this.removeFolderStructure(response.toString());
      });
    }
  }

  private async removeFolderStructure(path: string) {
    fileClient.deleteFolder(path).then((success: any) => {
      console.log(`Removed folder ${path}.`);
    }, (err: any) => console.log(err));
  }

  async checkFolderStructure() {
    await this.rdf.getSession();
    try {
      this.getChatUrl(this.thisUser.value, this.otherUser).then(charUrl => {
        fileClient.readFolder(charUrl).then((success: any) => {
          console.log('Folder structure correct');
        }, (err: any) => {
            console.log('Attempting to create: ' + charUrl);
            this.createFolderStructure(charUrl).then(res => {
              console.log('Creating ACL file...');
              this.grantAccessToFolder(charUrl, this.otherUser);
            });
        });
      });
    } catch (error) {
      console.log(`Error creating folder structure/with permissions: ${error}`);
    }
  }

  private async createFolderStructure(path: String) {
    await fileClient.createFolder(path).then((success: any) => {
      console.log(`Created folder ${path}.`);
    }, (err: string) => console.log('Could not create folder structure: ' + err));
  }

  private grantAccessToFolder(path: string | String, user: User) {
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
    fileClient.updateFile(path, acl).then((success: any) => {
      console.log('Folder permisions added');
    }, (err: string) => console.log('Could not set folder permisions' + err));
  }
}