import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { PasswordValidation } from './password-validation';
import { RegisterResponse } from './../models/register-response.model';
import { AuthService } from './../services/auth.service';
import { ErrorsService } from './../services/errors.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  userForm: FormGroup;
  password: AbstractControl;
  strongRegularExp: RegExp;
  mediumRegularExp: RegExp;
  errorMessage = '';
  loading = false;
  private registrationState: null | string;
  private successValue = 'success';

  constructor(
      private fb: FormBuilder,
      private router: Router,
      public authService: AuthService,
      private errorsService: ErrorsService
    ) {
    this.strongRegularExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
    this.mediumRegularExp = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})')
    this.createForm();
    this.password = this.userForm.controls['password'];
    this.registrationState = 'prereg';
  }

  ngOnInit() {
  }

  goToSignIn() {
    this.registrationState = null;
    this.router.navigate(['./', { outlets: { signin: ['sign-in']}}]);
  }

  createForm() {
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validator: PasswordValidation.MatchPassword
    });
  }

  register(form) {
    this.loading = true;
    this.authService.register(form.value)
      .subscribe((response) => {
        this.loading = false;
        if (response.code === this.successValue) {
          this.registrationState = this.successValue;
        }
      }, (err) => {
        this.loading = false;
        this.errorMessage = this.errorsService.getErrorMessage(err.message);
        window.scrollTo(0,document.body.scrollHeight);
      });
  }

  passwordStrength() {
    if (this.strongRegularExp.test(this.password.value)) {
      return 'strong';
    }
    if (this.mediumRegularExp.test(this.password.value)) {
      return 'medium';
    }
    return 'weak';
  }

  isWeak() {
    return this.password.dirty && this.passwordStrength() === 'weak';
  }
  
  isMedium() {
    return this.password.dirty && this.passwordStrength() === 'medium';
  }
  
  isStrong() {
    return this.password.dirty && this.passwordStrength() === 'strong';
  }

  passwordMatchError() {
    const confirmPassword = this.userForm.controls.confirmPassword;

    return confirmPassword.errors && confirmPassword.errors.MatchPassword && confirmPassword.dirty;
  }

}
