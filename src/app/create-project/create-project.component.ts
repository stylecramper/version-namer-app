import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { ProjectsService } from './../services/projects.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  projectForm: FormGroup;
  private successValue = 'success';
  private isLoggedIn: boolean;
  private projectCreationState = 'precreate'; // 'success'
  private loading: boolean;
  private errorMessage = '';
  private ERROR_TYPES: any = {
    USER: 'cannot_save_user',
    PROJECT: 'cannot_create_project'
  };
  private ERROR_MESSAGES: any = {
    USER: 'We couldn\'t save your user data. Please try again later.',
    PROJECT: 'An error occurred while saving this project. Please try again later.',
    GENERIC: 'Sorry, some random weird thing happened. Please try again later.'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private projectsService: ProjectsService,
    private router: Router
  ) {
    this.authService.getLoggedInStatus
      .subscribe(status => this.changeLoggedInStatus(status));
    this.createForm();
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  changeLoggedInStatus(status: boolean): void {
    this.isLoggedIn = status;
  }

  createForm() {
    this.projectForm = this.fb.group({
      projectname: ['', Validators.required]
    });
  }

  createProject(form) {
    this.loading = true;
    this.projectsService.createProject(form.value)
      .subscribe((res) => {
        if (res.code === this.successValue) {
          this.loading = false;
          this.projectCreationState = this.successValue;
          this.projectsService.addProject(res.project);
          this.router.navigate(['/projects']);
        }
      }, (err) => {
        this.loading = false;
        switch (err.message) {
          case this.ERROR_TYPES.USER:
              this.errorMessage = this.ERROR_MESSAGES.USER;
              break;
            case this.ERROR_TYPES.PROJECT:
              this.errorMessage = this.ERROR_MESSAGES.PROJECT;
              break;
            default:
              this.errorMessage = this.ERROR_MESSAGES.GENERIC;
              break;
        }
      });
  }

}
