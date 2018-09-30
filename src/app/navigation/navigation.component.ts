import { Component, OnInit } from '@angular/core';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  activeLink: string;

  constructor(private authService: AuthService) {
    this.authService.getLoggedInStatus
      .subscribe(status => this.changeLoggedInStatus(status));
  }

  ngOnInit() {
    this.activeLink = 'home';
  }

  changeLoggedInStatus(status: boolean): void {
    if (!status) {
      this.activeLink = 'home';
    }
  }

}
