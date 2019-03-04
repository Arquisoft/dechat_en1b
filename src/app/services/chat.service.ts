import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';
import { fn } from '@angular/compiler/src/output/output_ast';

@Injectable()
export class ChatService {

  chatMessages: ChatMessage[] = new Array<ChatMessage>();
  userName: string;
  friends: Array<User> = new Array<User>();

  constructor(private rdf : RdfService) {
    this.rdf.getProfile().then(response => this.userName = response.fn);
    this.loadFriends();
  }

  // TODO: at this time, profile pic for the main user is just an empty path, maybe we can fix this
  getUser() {
    return of(new User(this.userName, ""));
  }

  getUsers() : Observable<User[]> {
    return of(this.friends);
  }

  private async loadFriends() {
    await this.rdf.getSession();
    (await this.rdf.getFriends()).forEach(async element => {
      await this.rdf.fetcher.load(element.value);
      this.friends.push(new User(this.rdf.getValueFromVcard('fn', element.value), this.rdf.getValueFromVcard('hasPhoto', element.value)));
    });
  }

  sendMessage(msg: string) {
    if(msg !== "") {
      const timestamp = this.getTimeStamp();
      const newMsg = new ChatMessage(this.userName, msg);
      this.chatMessages.push(newMsg);
    }
  }

  getMessages(): Observable<ChatMessage[]> {
    return of(this.chatMessages);
  }

  getTimeStamp() {
    const now = new Date();
    const date = now.getUTCFullYear() + '/' +
                 (now.getUTCMonth() + 1) + '/' +
                 now.getUTCDate();
    const time = now.getUTCHours() + ':' +
                 now.getUTCMinutes() + ':' +
                 now.getUTCSeconds();
    return (date + ' ' + time);
  }
}
