import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'Version Name Generator';

  constructor(private router: Router, private authService: AuthService) { }

  loggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.unsetUser();
    this.router.navigate(['/home', { outlets: { signin: null }}]);
  }
}
