import { Component, OnInit } from '@angular/core';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'utility-navigation',
  templateUrl: './utility-navigation.component.html',
  styleUrls: ['./utility-navigation.component.css']
})
export class UtilityNavigationComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }

}
