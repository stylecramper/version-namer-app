import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
interface UserType { name: string, token: string };

@Injectable()
export class AuthService {
  user: UserType;
  @Output() getLoggedInStatus: EventEmitter<boolean> = new EventEmitter();

  constructor(private http: Http, private router: Router) {
    this.user = { name: '', token: '' };
  }

  register(userData: object) {
    const registerResult: Observable<any> = this.http.post('api/users', userData)
      .map(response => response.json())
      .catch((e) => {
        return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
      });
    return registerResult;
  }

  login(email: string, password: string) {
    const loginResult: Observable<any> = this.http.post('api/login', {email: email, password: password})
      .map(response => response.json())
      .catch((e) => {
        return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
      });
    return loginResult;
  }

  logout(): void {
    const logoutResult: Observable<any> = this.http.post('api/logout', { token: this.user.token })
      .map(response => response.json())
      .catch((e) => {
        return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
      });
    logoutResult
      .subscribe((res) => {console.log('##### logging out successful');
        this.user.token = '';
        localStorage.removeItem('username');
        localStorage.removeItem('usertoken');
        this.router.navigate(['/home', { outlets: { signin: null }}]);
      });

  }

  getUser(): UserType {
    return {name: localStorage.getItem('username'), token: localStorage.getItem('usertoken')};
  }

  getUsername(): string {
    return localStorage.getItem('username');
  }

  setUser(name: string, token: string): void {
    this.user.name = name;
    this.user.token = token;
    localStorage.setItem('username', name);
    localStorage.setItem('usertoken', token);
    if (this.user.token) {
      this.getLoggedInStatus.emit(true);
    }
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('usertoken') !== null;
  }

}

export const AUTH_PROVIDERS: Array<any> = [
  { provide: AuthService, useClass: AuthService }
];
