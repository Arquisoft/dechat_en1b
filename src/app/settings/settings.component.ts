import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  webId : string;

  constructor(private chat : ChatService, private toastr : ToastrService) { }

  ngOnInit() {
  }

  addFriend() {
    if (!this.webId) {
      this.toastr.error("Please add a webId", "Wrong input");
    } else if (this.webId.trim() === "") {
      this.toastr.error("Please add a webId", "Wrong input");
    } else {
      this.chat.addFriend(this.webId.trim());
      this.webId = "";
    }
  }

  handleSubmit(event) {
    if (event.keyCode === 13) {
      this.addFriend();
    }
  }

}
