import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ChatMessage } from '../models/chat-message.model';
import { RdfService } from './rdf.service';
import { User } from '../models/user.model';

@Injectable()
export class ChatService {

  chatMessages: ChatMessage[] = new Array<ChatMessage>();;

  constructor(private rdf : RdfService) {
        
  }

  getUser() {
    return of(new User("Miguel"));
  }

  getUsers() : Observable<User[]> {
    var users = new Array<User>();
    users.push(new User("Fulanito"));
    users.push(new User("Menganito"));
    users.push(new User("Adolfito"));
    return of(users);
  }

  sendMessage(msg: string) {
    const timestamp = this.getTimeStamp();
    const newMsg = new ChatMessage("Miguel", msg);
    this.chatMessages.push(newMsg);
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
