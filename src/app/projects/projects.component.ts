import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';

import { AuthService } from '../services/auth.service';
import { ErrorsService } from './../services/errors.service';
import { ProjectsService } from './../services/projects.service';
import { ProjectType } from '../types/project-types';
import { ConfirmDialogComponent } from './../common/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  private isLoggedIn: boolean;
  private projects: Array<ProjectType> = [];
  private projectsFetched = false;
  private loading;
  private errorMessage = '';

  constructor(
    private authService: AuthService,
    private errorsService: ErrorsService,
    private projectsService: ProjectsService,
    private router: Router,
    public confirmDialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    this.loading = false;
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
    if (!status) {
      this.projects = [];
      return;
    }
    this.fetchProjects();
  }

  createProject(): void {
    this.router.navigate(['/create-project', { outlets: { signin: null }}]);
  }

  hasProjects() {
    return Array.isArray(this.projects) && this.projects.length > 0;
  }

  errorState() {
    return this.errorMessage !== '';
  }

  fetchProjects() {
    this.loading = true;
    this.projectsService.fetchProjects()
        .subscribe((data) => {
          this.projectsFetched = true;
          this.loading = false;
          this.projects = data.projects;
          this.projectsService.setProjects(this.projects);
        }, (err) => {
          this.loading = false;
          this.errorMessage = this.errorsService.getErrorMessage(err.message);
        });
  }

  editVersionNames(project: ProjectType): void {
    this.router.navigate(['/version-names/', project.id]);
  }

  deleteProject(project: ProjectType): any {
    this.loading = true;
    this.projectsService.deleteProject(project.id)
      .subscribe((data) => {
        this.loading = false;
        if (data.code === 'success') {
          this.snackBar.open(`Project "${data.projectName}" deleted.`, '', { duration: 1000 });
          this.projects = this.projects.filter((proj: ProjectType) => {
            return proj.id !== data.projectId;
          });
          this.projectsService.setProjects(this.projects);
        }
      }, (err) => {
        this.loading = false;
        this.errorMessage = this.errorsService.getErrorMessage(err.message);
      });
  }

  openConfirmDialog(project: ProjectType): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.height = '180px';
    dialogConfig.width = '400px';
    dialogConfig.data = {
      id: 1,
      title: 'Delete Project',
      content: 'Are you sure you want to delete this project?',
      project: project
    };

    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.deleteProject(dialogConfig.data.project);
        }
      });
  }

}
