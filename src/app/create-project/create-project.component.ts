import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    this.projectsService.createProject(form.value)
      .subscribe((res) => {
        if (res.code === this.successValue) {
          this.projectCreationState = this.successValue;
          this.projectsService.addProject(res.project);
          this.router.navigate(['/projects']);
        }
      });
  }

}
