import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

import * as fileClient from 'solid-file-client'

const reloadInterval = 2000;

@Injectable()
export class ChatService {

  isActive : BehaviorSubject<boolean>; //If the chat is Active (The client is chating with a contact)

  chatMessages: ChatMessage[] = new Array<ChatMessage>();

  thisUser: User;  //current user that is using the chat
  currentUserWebId: string // current user's webID username

  otherUser: User; //current user its talking to

  friends: Array<User> = new Array<User>();

  constructor(private rdf : RdfService, private toastr : ToastrService) {
    this.rdf.getSession();
    this.loadUserData().then(response => {
      this.loadFriends();
    });
    this.isActive = new BehaviorSubject<boolean>(false);
  }

  loadLoop() {
    timer(0, reloadInterval).pipe(
      mergeMap(_ => this.loadMessages())
    ).subscribe();
  }

  //Observables

  getUser() {
    return of(this.thisUser);
  }

  getOtherUser() {
    return of(this.otherUser);
  }

  getUsers() : Observable<User[]> {
    return of(this.friends);
  }

  isChatActive() : Observable<boolean> {
    return this.isActive.asObservable();
  }

  getMessages(): Observable<ChatMessage[]> {
    return of(this.chatMessages);
  }

  //Loading methods

  private async loadUserData() {
    await this.rdf.getSession();
    let webId = this.rdf.session.webId;
    this.thisUser = new User(webId, "", "");
    await this.rdf.getFieldAsStringFromProfile("fn").then(response => {
      this.thisUser.username = response;
    });
    await this.rdf.getFieldAsStringFromProfile("hasPhoto").then(response => {
      this.thisUser.profilePicture = response;
    });
    this.currentUserWebId = webId.split("/")[2].split(".")[0];
  }

  private async loadFriends() {
    await this.rdf.getSession();
    (await this.rdf.getFriends()).forEach(async element => {
      await this.rdf.fetcher.load(element.value);
      let photo: string = this.rdf.getValueFromVcard("hasPhoto", element.value) || "../assets/images/profile.png";
      this.friends.push(new User(element.value ,this.rdf.getValueFromVcard("fn", element.value), photo));
    });
  }

  private async loadMessages() {
    console.log("Loading messages...");
    if (!this.isActive) {
      return;
    }
    await this.rdf.getSession();
    this.chatMessages.length = 0;
    this.loadMessagesFromTo(this.otherUser, this.thisUser);
    this.loadMessagesFromTo(this.thisUser, this.otherUser);
  }

  private async loadMessagesFromTo(user1 : User, user2 : User) {
    let messages = (await this.rdf.getElementsFromContainer(await this.getChatUrl(user1, user2)))
    if (!messages) {
      this.toastr.error("Please make sure the other user has clicked on your chat", "Could not load messages");
      this.isActive.next(false);
      this.chatMessages.length = 0;
      return;
    }
    messages.forEach(async element => {
      const url = element.value + "#message";
      await this.rdf.fetcher.load(url);
      const sender = this.rdf.getValueFromSchema("sender", url);
      const text = this.rdf.getValueFromSchema("text", url);
      const date = Date.parse(this.rdf.getValueFromSchema("dateSent", url));
      const name = await this.rdf.getFriendData(sender, "fn");
      console.log("Messages loaded: " + messages);
      this.addMessage(new ChatMessage(name, text, date));
    });
  }

  //Message methods

  /**
   * Gets the URL for the chat resource location
   * @param user1 user who sends
   * @param user2 user who recieves
   */
  private async getChatUrl(user1 : User, user2 : User) : Promise<String> {
    await this.rdf.getSession();
    let root = await user1.webId.replace("/profile/card#me", "/private/dechat/chat_");
    let name = await user2.webId.split("/")[2].split(".")[0];
    let finalUrl = root + name + "/";
    // console.log(finalUrl);
    return finalUrl;
  }

  private sortByDateDesc(m1, m2) {
    return m1.timeSent > m2.timeSent ? 1 : m1.timeSent < m2.timeSent ? -1 : 0;
  }

  private addMessage(message : ChatMessage) {
    this.chatMessages.push(message);
    this.chatMessages.sort(this.sortByDateDesc);
  }

  async sendMessage(msg: string) {
    if(msg !== "" && this.otherUser) {
      const newMsg = new ChatMessage(this.thisUser.username, msg);
      this.addMessage(newMsg);
      this.postMessage(newMsg).then(res => this.loadMessages());
    }
  }

  private async postMessage(msg : ChatMessage) {
    let message = `
    @prefix : <#>.
    @prefix schem: <http://schema.org/>.
    @prefix s: <${this.thisUser.webId.replace("#me","#")}>.

    :message
      a schem:Message;
      schem:sender s:me;
      schem:text "${msg.message}";
      schem:dateSent "${msg.timeSent.toISOString()}".
    `;
    let path = await this.getChatUrl(this.thisUser, this.otherUser) + "message.ttl";
    fileClient.createFile(path).then(fileCreated => {
      fileClient.updateFile(fileCreated, message).then( success => {
        console.log("Message has been sended succesfully")
      }, err => console.log(err) );
    });
  }

  async changeChat(user : User) {
    this.isActive.next(true);
    this.otherUser = user;
    this.checkFolderStructure().then(response => {
      this.loadMessages();
    });
    this.loadLoop();
  }

  //Solid methods

  addFriend(webId : string) {
    this.rdf.addFriend(webId);
  }

  removeFriend(webId : string) {
    let name = webId.split("/")[2].split(".")[0];
    console.log(name);
    if(this.thisUser.webId !== webId) {
      this.rdf.removeFriend(webId);
      this.getChatUrl(this.thisUser, this.otherUser).then(response => {
        this.removeFolderStructure(response.toString());
      });
    }
  }

  async checkFolderStructure() {
    await this.rdf.getSession();
    try {
      this.getChatUrl(this.thisUser, this.otherUser).then(charUrl => {
        fileClient.readFolder(charUrl).then(success => {
          console.log("Folder structure correct");
        }, err => {
            console.log("Attempting to create: " + charUrl);
            this.createFolderStructure(charUrl).then(res => {
              console.log("Creating ACL file...");
              this.grantAccessToFolder(charUrl, this.otherUser);
            });
        });
      });
    } catch (error) {
      console.log(`Error creating folder structure/with permissions: ${error}`);
    }
  }

  private async createFolderStructure(path) {
    await fileClient.createFolder(path).then(success => {
      console.log(`Created folder ${path}.`);
    }, err => console.log("Could not create folder structure: " + err));
  }

  private async removeFolderStructure(path : string) {
    console.log(path);
    // fileClient.deleteFolder(path).then(success => {
    //   console.log(`Removed folder ${path}.`);
    // }, err => console.log(err));
  }

  private grantAccessToFolder(path, user : User) {
    let webId = user.webId.replace("#me", "#");
    let acl =
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
    path += ".acl";
    fileClient.updateFile(path, acl).then( success => {
      console.log("Folder permisions added");
    }, err => console.log("Could not set folder permisions" + err) );
  }
}