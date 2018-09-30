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

  register(userData: object): Observable<any> {
    return this.http.post('api/users', userData)
      .catch((err) => {
        return Observable.throw(new Error(err.error.message));
      });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('api/login', { email: email, password: password })
      .catch((err) => {
        return Observable.throw(new Error(err.error.message));
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

  unsetUser(): void {
    this.user.name = '';
    this.user.token = '';
    localStorage.removeItem('username');
    localStorage.removeItem('usertoken');
    this.getLoggedInStatus.emit(false);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('usertoken') !== null;
  }

}

export const AUTH_PROVIDERS: Array<any> = [
  { provide: AuthService, useClass: AuthService }
];
