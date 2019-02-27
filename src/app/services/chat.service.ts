import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';

@Injectable()
export class ChatService {

  chatMessages: Observable<ChatMessage[]>;

  constructor(private rdf : RdfService) {
        
  }

  getUser() {
    return this.getUsers().subscribe(users => {
      return users[0];
    });
  }

  getUsers() : Observable<User[]> {
    var users = new Array<User>();
    return new Observable();
  }

  sendMessage(msg: string) {
    const timestamp = this.getTimeStamp();
    this.chatMessages = this.getMessages();
    this.chatMessages.toPromise();
  }

  getMessages(): Observable<ChatMessage[]> {
    var messages = new Array<ChatMessage>();
    return new Observable();
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
