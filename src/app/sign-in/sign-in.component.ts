import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    this.router.navigate(['./', { outlets: { signin: null }}]);
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
  }

}
