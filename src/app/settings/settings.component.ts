import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../services/solid.auth.service';
import { SolidProvider } from '../models/solid-provider.model';
@Component({  
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  identityProviders: SolidProvider[];

  webIdAddFriend: string;
  selectedAddProviderUrl: string;
  customAddProviderUrl: string;

  webIdRemoveFriend: string;
  selectedRemoveProviderUrl: string;
  customRemoveProviderUrl: string;

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
      var urlAddedFriend = this.createWebId(this.selectedAddProviderUrl, this.webIdAddFriend, this.customAddProviderUrl);
      this.chat.addFriend(urlAddedFriend.trim());
      this.webIdAddFriend = '';
    }
  }

  removeFriend() {
    if (!this.webIdRemoveFriend) {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else if (this.webIdRemoveFriend.trim() === '') {
      this.toastr.error('Please add a webId', 'Wrong input');
    } else {
      var urlRemovedFriend = this.createWebId(this.selectedRemoveProviderUrl, this.webIdRemoveFriend, this.customRemoveProviderUrl);
      this.chat.removeFriend(urlRemovedFriend.trim());
      this.webIdRemoveFriend = '';
    }
  }

  handleSubmit(event: { keyCode: number; }) {
    if (event.keyCode === 13) {
      this.addFriend();
    }
  }

  // Auxiliar

  createWebId(provider, id, customProvider) {
    if(provider === 'https://solid.community'){
      return 'https://' + id + '.solid.community/profile/card#me';
    }
    else if(provider === 'https://inrupt.net/auth'){
      return 'https://' + id + '.inrupt.net/profile/card#me';
    } else {
      return 'https://' + id + '.' + customProvider + '/profile/card#me';
    }
  }

}
