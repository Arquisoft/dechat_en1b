import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-user-settings-list',
  templateUrl: './user-settings-list.component.html',
  styleUrls: ['./user-settings-list.component.css']
})
export class UserSettingsListComponent {
  users: User[];

  constructor(chat: ChatService) {
    chat.getUsers().subscribe(users => {
      this.users = users;
    });
  }
}
