import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  @ViewChild('email') emailField: ElementRef;
  @ViewChild('password') passwordField: ElementRef;
  signinForm: FormGroup;
  message: string;
  loading = false;
  ERROR_TYPES: any = {
    EMAIL: 'unknown_email',
    PASSWORD: 'incorrect_password'
  };
  ERROR_MESSAGES: any = {
    EMAIL: 'We don\'t know that email',
    PASSWORD: 'That password is incorrect',
    GENERIC: 'Some random weird thing happened'
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
    this.loading = true;
    this.message = '';
    this.authService.login(form.controls.email.value, form.controls.password.value)
      .subscribe((response) => {
        this.loading = false;
        this.authService.setUser(response.name, response.access_token);
        this.close();
      }, (err) => {
        this.loading = false;
        this.displayError(err);
      });
  }

  logout(): boolean {
    this.authService.logout();
    return false;
  }

  displayError(error: Error): void {
    switch (error.message) {
      case this.ERROR_TYPES.EMAIL:
        this.emailField.nativeElement.focus();
        this.message = this.ERROR_MESSAGES.EMAIL;
        break;
      case this.ERROR_TYPES.PASSWORD:
        this.passwordField.nativeElement.focus();
        this.message = this.ERROR_MESSAGES.PASSWORD;
        break;
      default:
        this.message = this.ERROR_MESSAGES.GENERIC;
        break;
    }
  }

}
