import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  webIdAddFriend: string;
  webIdRemoveFriend: string;

  constructor(private chat: ChatService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  addFriend() {
    if (!this.webIdAddFriend) {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else if (this.webIdAddFriend.trim() === '') {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else {
      this.chat.addFriend(this.webIdAddFriend.trim());
      this.webIdAddFriend = '';
    }
  }

  removeFriend() {
    if (!this.webIdRemoveFriend) {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else if (this.webIdRemoveFriend.trim() === '') {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else {
      this.chat.removeFriend(this.webIdRemoveFriend.trim());
      this.webIdRemoveFriend = '';
    }
  }

  handleSubmit(event: { keyCode: number; }) {
    if (event.keyCode === 13) {
      this.addFriend();
    }
  }

}
