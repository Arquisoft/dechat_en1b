import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ToastrService } from 'ngx-toastr';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/solid.auth.service';
import { SolidProvider } from '../models/solid-provider.model';
@Component({  
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  webIdAddFriend: string;
  webIdRemoveFriend: string;
  identityProviders: SolidProvider[];
  selectedProviderUrl: string;
  urlAddedFriend: string;
  customProviderUrl: string;

  constructor(public chat: ChatService, private toastr: ToastrService, private auth: AuthService, private sdv: Router) { }

  ngOnInit() {
    this.identityProviders = this.auth.getIdentityProviders();
  }

  addFriend() {
    //Como es la url de una cuenta de inrupt?
    //https://permenfer98.inrupt.net/profile/card#me
    if (!this.webIdAddFriend) {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else if (this.webIdAddFriend.trim() === '') {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else {
      if(this.selectedProviderUrl=== 'https://solid.community'){
        this.urlAddedFriend = 'https://' + this.webIdAddFriend + '.solid.community/profile/card#me';
      }
      else if(this.selectedProviderUrl=== 'https://inrupt.net/auth'){
        this.urlAddedFriend = 'https://' + this.webIdAddFriend + '.inrupt.net/profile/card#me';
      }else{
        this.urlAddedFriend = 'https://' + this.webIdAddFriend + '.' + this.customProviderUrl + '/profile/card#me';
      }
      console.log('Intentando añadir: ' + this.urlAddedFriend);
      this.chat.addFriend(this.urlAddedFriend.trim());
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
