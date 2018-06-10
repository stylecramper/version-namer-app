import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  constructor() { }

  login(email: string, password: string): boolean {
    if (email === 'email' && password === 'password') {
      localStorage.setItem('username', 'Matt');
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('username');
  }

  getUser(): string {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

}
