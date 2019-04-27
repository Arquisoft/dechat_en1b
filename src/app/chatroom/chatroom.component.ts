import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {
  @ViewChild('scroller') private feedContainer: ElementRef;

  active : boolean = false;

  constructor(private chat : ChatService) { 
    this.chat.isChatActive().subscribe(active => {
      this.active = active;
    });
  }

  ngOnInit() {
    this.chat.refreshScroll.subscribe(() => {
      this.scrollToBottom();
    });
  }

  scrollToBottom(): void {
    this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
  }

}
