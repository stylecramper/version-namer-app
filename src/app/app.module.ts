import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ConfirmDialogComponent } from './common/confirm-dialog/confirm-dialog.component';
import { HomeComponent } from './home/home.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NamesService } from './services/names.service';
import { AuthService } from './services/auth.service';
import { ProjectsService } from './services/projects.service';
import { VersionNamesService } from './services/version-names.service';
import { ErrorsService } from './services/errors.service';
import { SignInComponent } from './sign-in/sign-in.component';
import { RegisterComponent } from './register/register.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectItemComponent } from './projects/project-item/project-item.component';
import { UtilityNavigationComponent } from './utility-navigation/utility-navigation.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { VersionNamesComponent } from './version-names/version-names.component';
import { SpinnerComponent } from './common/spinner/spinner.component';
import { AutofocusDirective } from './common/focus-directive/focus.directive';

const ROUTES = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    outlet: 'signin'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'projects',
    component: ProjectsComponent
  },
  {
    path: 'create-project',
    component: CreateProjectComponent
  },
  {
    path: 'version-names/:id',
    component: VersionNamesComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    HomeComponent,
    NavigationComponent,
    SignInComponent,
    RegisterComponent,
    ProjectsComponent,
    ProjectItemComponent,
    UtilityNavigationComponent,
    CreateProjectComponent,
    VersionNamesComponent,
    SpinnerComponent,
    AutofocusDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES)
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  providers: [
    NamesService,
    AuthService,
    ProjectsService,
    VersionNamesService,
    ErrorsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
