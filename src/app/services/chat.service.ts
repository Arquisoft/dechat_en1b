import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';

const fileClient = require('solid-file-client');
@Injectable()
export class ChatService {

  isActive : BehaviorSubject<boolean>; //If the chat is Active (The client is chating with a contact)

  chatMessages: ChatMessage[] = new Array<ChatMessage>();

  thisUser: User;  //current user that is using the chat
  otherUser: User; //current user its talking to

  friends: Array<User> = new Array<User>();

  constructor(private rdf : RdfService) {
    this.rdf.getSession();
    this.loadUserData().then(r => {
      this.loadFriends();
    });
    this.checkFolderStructure();
    this.isActive = new BehaviorSubject<boolean>(false);
  }

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

  private async loadUserData() {
    await this.rdf.getSession();
    this.thisUser = new User(this.rdf.session.webId, "", "");
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
      this.friends.push(new User(element.value ,this.rdf.getValueFromVcard("fn", element.value), photo));
    });
  }

  private async loadMessages() {
    if (!this.isActive) 
      return;
    await this.rdf.getSession();
    this.chatMessages.length = 0;
    await this.loadMessagesFromTo(this.otherUser, this.thisUser);
    await this.loadMessagesFromTo(this.thisUser, this.otherUser);
  }

  private async loadMessagesFromTo(user1 : User, user2 : User) {
    (await this.rdf.getElementsFromContainer(await this.getChatUrl(user1, user2))).forEach(async element => {
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
   * @param user1 user who sends
   * @param user2 user who recieves
   */
  private async getChatUrl(user1 : User, user2 : User) : Promise<String> {
    let webId : string = this.rdf.session.webId;
    let root = user1.webId.replace("/profile/card#me", "/private/dechat/chat_");
    let name = user2.webId.replace(".solid.community/profile/card#me", "").replace("https://", "");
    let finalUrl = root + name + "/";
    //console.log(finalUrl);
    return finalUrl;
  }

  private addMessage(message : ChatMessage) {
    this.chatMessages.push(message);
    //this.chatMessages.sort((m1, m2) => m1.timeSent.getMilliseconds() - m2.timeSent.getMilliseconds());
    this.chatMessages.sort();
  }

  async sendMessage(msg: string) {
    if(msg !== "" && this.otherUser) {
      const newMsg = new ChatMessage(this.thisUser.username, msg);
      await this.rdf.postMessage(newMsg, await this.getChatUrl(this.thisUser, this.otherUser));
      this.loadMessages();
    }
  }

  getMessages(): Observable<ChatMessage[]> {
    return of(this.chatMessages);
  }

  changeChat(user : User) {
    console.log("Change to: " + user.username);
    this.isActive.next(true);
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
