import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, User } from '../models';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(this.loadUser());
  token = signal<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  signup(name: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${API}/auth/signup`, { name, email, password }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.token.set(res.access_token);
    this.currentUser.set(res.user);
  }

  private loadUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
}
