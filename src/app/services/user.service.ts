import { Injectable } from '@angular/core';
import { SolidProfile } from '../models/solid-profile.model';
import { RdfService } from './rdf.service';
import { AuthService } from './solid.auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  profile: SolidProfile;

  constructor(private rdf: RdfService, private auth: AuthService) { 
    
  }

  ngOnInit() {
    this.loadProfile();
  }

  // Loads the profile from the rdf service and handles the response
  async loadProfile() {
    try {
      const profile = await this.rdf.getProfile();
      if (profile) {
        this.profile = profile;
        this.auth.saveOldUserData(profile);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  profilePicture(): string {
    return this.profile ? this.profile.image : '/assets/images/profile.png';
  }

}
