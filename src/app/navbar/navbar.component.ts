import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/solid.auth.service';
import { SolidSession } from '../models/solid-session.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: Observable<SolidSession>;
  profileImage: string;

  constructor(private authService: AuthService, private userService : UserService) { }

  ngOnInit() {
    this.profileImage = this.userService.profilePicture();
  }

  logout() {
    this.authService.solidSignOut();
  }
}
