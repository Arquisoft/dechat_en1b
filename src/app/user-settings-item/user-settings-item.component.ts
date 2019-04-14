import { Component, OnInit, Input } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { User } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-settings-item',
  templateUrl: './user-settings-item.component.html',
  styleUrls: ['./user-settings-item.component.css']
})
export class UserSettingsItemComponent implements OnInit {

  @Input() user: User = new User("","Test","");

  constructor(private chatService : ChatService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  deleteUser() {
    this.removeFriend(this.user.webId);
  }

  removeFriend(id: string) {
    if (id.trim() === '') {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else {
      this.chatService.removeFriend(id);
    }
  }

}
