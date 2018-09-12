import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  signinForm: FormGroup;
  message: string;
  ERROR_TYPES: any = {
    EMAIL: 'unknown_email',
    PASSWORD: 'incorrect_password'
  };
  ERROR_MESSAGES: any = {
    EMAIL: 'We don\'t know that email',
    PASSWORD: 'That password is incorrect'
  };

  constructor(private fb: FormBuilder, public authService: AuthService, private router: Router) {
    this.message = '';
    this.createForm();
  }

  createForm() {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  close() {
    this.router.navigate(['./', { outlets: { signin: null }}]);
  }

  login(form) {
    this.message = '';
    this.authService.login(form.controls.email.value, form.controls.password.value)
      .subscribe((res) => {
        if (res.code === 'success') {
          this.authService.setUser(res.name, res.access_token);
          this.close();
        } else {
          this.displayError(res.message);
        }
      });
  }

  logout(): boolean {
    this.authService.logout();
    return false;
  }

  displayError(type: string): void {
    if (type === this.ERROR_TYPES.EMAIL) {
      this.message = this.ERROR_MESSAGES.EMAIL;
    } else if (type === this.ERROR_TYPES.PASSWORD) {
      this.message = this.ERROR_MESSAGES.PASSWORD;
    }
  }

}
