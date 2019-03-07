import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';
import { fn } from '@angular/compiler/src/output/output_ast';
import { async } from 'q';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

const fileClient = require('solid-file-client');
@Injectable()
export class ChatService {

  chatMessages: ChatMessage[] = new Array<ChatMessage>();

  thisUser: User;  //current user that is using the chat
  otherUser: User; //current user its talking to

  friends: Array<User> = new Array<User>();

  constructor(private rdf : RdfService) {
    this.rdf.getSession();
    this.loadUserData().then(r => {
      this.loadFriends();
      this.loadMessages();
    });
    this.setUpFolders();
  }

  getUser() {
    return of(this.thisUser);
  }

  getUsers() : Observable<User[]> {
    return of(this.friends);
  }

  private async loadUserData() {
    await this.rdf.getSession();
    this.thisUser = new User("", "");
    await this.rdf.getFieldAsStringFromProfile("fn").then(response => {
      this.thisUser.username = response;
    });
    await this.rdf.getFieldAsStringFromProfile("hasPhoto").then(response => {
      this.thisUser.profilePicture = response;
    });
  }

  private async loadFriends() {
    await this.rdf.getSession();
    (await this.rdf.getFriends()).forEach(async element => {
      await this.rdf.fetcher.load(element.value);
      let photo: string = this.rdf.getValueFromVcard("hasPhoto", element.value) || "../assets/images/profile.png";
      this.friends.push(new User(this.rdf.getValueFromVcard("fn", element.value), photo));
    });
  }

  private async loadMessages() {
    await this.rdf.getSession();
    this.chatMessages.length = 0;
    (await this.rdf.getElementsFromContainer(await this.getChatUrl(this.thisUser, this.otherUser))).forEach(async element => {
      const url = element.value + "#message";
      await this.rdf.fetcher.load(url);
      const sender = this.rdf.getValueFromSchema("sender", url);
      const text = this.rdf.getValueFromSchema("text", url);
      const date = Date.parse(this.rdf.getValueFromSchema("dateSent", url));
      const name = await this.rdf.getFriendData(sender, "fn");
      this.addMessage(new ChatMessage(name, text, date));
    });
  }

  /**
   * Gets the URL for the chat resource location
   * @param user1
   * @param user2
   */
  private async getChatUrl(user1 : User, user2 : User) : Promise<String> {
    let webId : string = this.rdf.session.webId;
    let root = webId.replace("/profile/card#me", "/private/dechat/chat/");
    return root;
  }

  private addMessage(message : ChatMessage) {
    this.chatMessages.push(message);
    //this.chatMessages.sort((m1, m2) => m1.timeSent.getMilliseconds() - m2.timeSent.getMilliseconds());
    this.chatMessages.sort();
  }

  sendMessage(msg: string) {
    if(msg !== "") {
      const newMsg = new ChatMessage(this.thisUser.username, msg);
      this.addMessage(newMsg);
    }
  }

  getMessages(): Observable<ChatMessage[]> {
    return of(this.chatMessages);
  }

  changeChat(user : User) {
    console.log("Change to: " + user.username);
    this.otherUser = user;
    this.loadMessages();
  }

  private getTimeStamp() {
    const now = new Date();
    const date = now.getUTCFullYear() + '/' +
                 (now.getUTCMonth() + 1) + '/' +
                 now.getUTCDate();
    const time = now.getUTCHours() + ':' +
                 now.getUTCMinutes() + ':' +
                 now.getUTCSeconds();
    return (date + ' ' + time);
  }

  addFriend(webId : string) {
    this.rdf.addFriend(webId);
  }

  async checkFolderStructure() {
    await this.rdf.getSession();
    let webId : string = this.rdf.session.webId;
    let root = webId.replace("/profile/card#me", "/private/dechat/chat/");
    fileClient.readFolder(root).then(folder => {
      console.log("Folder structure correct");
    }, err => this.createFolderStructure(root));
  }

  createFolderStructure(root : string) {
    fileClient.createFolder(root).then(success => {
      console.log(`Created folder ${root}.`);
    }, err => console.log(err));
  }
}
