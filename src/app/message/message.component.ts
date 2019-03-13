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
    
  }

  ngOnInit(chatMessage = this.chatMessage) {
    if (!chatMessage)
      chatMessage = new ChatMessage("","Failed to load");
    this.messageContent = chatMessage.message;
    this.timeStamp = chatMessage.timeSent;
    this.userName = chatMessage.userName;
    this.chatService.getUser().subscribe(user => {
      if (!user)
        return;
      console.log(user.username + " " + this.userName);
      this.isOwnMessage = user.username === this.userName;
    });
  }
}
