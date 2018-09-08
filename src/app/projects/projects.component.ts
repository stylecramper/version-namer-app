import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { ProjectsService } from './../services/projects.service';
import { ProjectType } from '../types/project-types';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  private isLoggedIn: boolean;
  private projects: Array<ProjectType> = [];
  private projectsFetched = false;

  constructor(
    private authService: AuthService,
    private projectsService: ProjectsService,
    private router: Router
  ) {
    this.authService.getLoggedInStatus
      .subscribe(status => this.changeLoggedInStatus(status));
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn && !this.projectsFetched) {
      this.fetchProjects();
    }
  }

  changeLoggedInStatus(status: boolean): void {
    this.isLoggedIn = status;
    this.fetchProjects();
  }

  createProject(): void {
    this.router.navigate(['/create-project', { outlets: { signin: null }}]);
  }

  hasProjects() {
    return Array.isArray(this.projects) && this.projects.length > 0;
  }

  fetchProjects() {
    this.projectsService.fetchProjects()
        .subscribe((data) => {
          this.projectsFetched = true;
          this.projects = this.projects.concat(data.projects);
          this.projectsService.setProjects(this.projects);
        });
  }

  editVersionNames(project: ProjectType): void {
    this.router.navigate(['/version-names/', project.id]);
  }

}
