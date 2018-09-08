import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NamesService } from './services/names.service';
import { AuthService } from './services/auth.service';
import { ProjectsService } from './services/projects.service';
import { SignInComponent } from './sign-in/sign-in.component';
import { RegisterComponent } from './register/register.component';
import { ProjectsComponent } from './projects/projects.component';
import { UtilityNavigationComponent } from './utility-navigation/utility-navigation.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { VersionNamesComponent } from './version-names/version-names.component';

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
    HomeComponent,
    NavigationComponent,
    SignInComponent,
    RegisterComponent,
    ProjectsComponent,
    UtilityNavigationComponent,
    CreateProjectComponent,
    VersionNamesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [NamesService, AuthService, ProjectsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
