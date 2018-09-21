import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
interface UserType { name: string; token: string; }

@Injectable()
export class AuthService {
  user: UserType;
  @Output() getLoggedInStatus: EventEmitter<boolean> = new EventEmitter();

  constructor(private http: HttpClient) {
    this.user = { name: '', token: '' };
  }

  register(userData: object) {
    const registerResult: Observable<any> = this.http.post('api/users', userData)
      .map((response) => { /* return response.json(); */ })
      .catch((e) => {
        return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
      });
    return registerResult;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('api/login', { email: email, password: password })
      .catch((err) => {
        return Observable.throw(new Error(err.error.message));
      });
  }

  logout(): void {
    this.user.token = '';
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
