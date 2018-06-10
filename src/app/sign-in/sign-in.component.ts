import { Component, OnInit } from '@angular/core';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  message: string;

  constructor(public authService: AuthService) {
    this.message = '';
  }

  ngOnInit() {
  }

  login(email: string, password: string) {
    this.message = '';
    if (!this.authService.login(email, password)) {
      this.message = 'Incorrect credentials.';
      setTimeout(function() {
        this.message = '';
      }.bind(this), 2500);
    }
  }

  logout(): boolean {
    this.authService.logout();
    return false;
  }

}
