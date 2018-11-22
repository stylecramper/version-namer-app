import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from './../services/auth.service';
import { ErrorsService } from './../services/errors.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  @ViewChild('email') emailField: ElementRef;
  @ViewChild('password') passwordField: ElementRef;
  signinForm: FormGroup;
  errorMessage: string;
  loading = false;
  loginErrorTypes: any = {
    UNKNOWN_EMAIL: 'unknown_email',
    INCORRECT_PASSWORD: 'incorrect_password'
  };

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private errorsService: ErrorsService
    ) {
    this.errorMessage = '';
    this.createForm();
  }

  createForm() {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  close() {
    this.router.navigate([ { outlets: { primary: 'projects', signin: null }} ]);
  }

  login(form) {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(form.controls.email.value, form.controls.password.value)
      .subscribe((response) => {
        this.loading = false;
        this.authService.setUser(response.name, response.access_token);
        this.close();
      }, (err) => {
        this.loading = false;
        this.displayLoginError(err);
      });
  }

  displayLoginError(error: Error): void {
    this.errorMessage = this.errorsService.getErrorMessage(error.message);
    switch(error.message) {
      case this.loginErrorTypes.UNKNOWN_EMAIL:
        this.signinForm.controls.email.reset();
        this.emailField.nativeElement.focus();
        break;
      case this.loginErrorTypes.INCORRECT_PASSWORD:
        this.signinForm.controls.password.reset();
        this.passwordField.nativeElement.focus();
        break;
      default:
        this.signinForm.controls.email.reset();
        this.signinForm.controls.password.reset();
        this.emailField.nativeElement.focus();
        break;
    }
  }

}
