import { Component, OnInit, Input } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/chat-message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  @Input() chatMessage: ChatMessage;
  userName: string;
  messageContent: string;
  timeStamp: Date = new Date();

  isOwnMessage: boolean;

  constructor(private chatService : ChatService) {
    this.chatService.getUser().subscribe(user => {
      if (!user)
        return;
      this.userName = user.username;
      this.isOwnMessage = user.username === this.userName;
    });
  }

  ngOnInit(chatMessage = this.chatMessage) {
    if (!chatMessage)
      chatMessage = new ChatMessage("Test","test");
    this.messageContent = chatMessage.message;
    this.timeStamp = chatMessage.timeSent;
    this.userName = chatMessage.userName;
  }
}
