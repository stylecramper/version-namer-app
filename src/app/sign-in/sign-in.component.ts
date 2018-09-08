import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  signinForm: FormGroup;
  message: string;

  constructor(private fb: FormBuilder, public authService: AuthService, private router: Router) {
    this.message = '';
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.signinForm = this.fb.group({
      email: ['', Validators.required],
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
        if (res.hasOwnProperty('access_token')) {
          this.authService.setUser(res.name, res.access_token);
          this.close();
        }
      });
  }

  logout(): boolean {
    this.authService.logout();
    return false;
  }

}
