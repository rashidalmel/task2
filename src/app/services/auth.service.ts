import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  birthDate: string;
  password: string; // Add password to the interface
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  register(userData: Omit<User, 'id' | 'password'> & { password: string }): boolean {
    // Check if user already exists
    const existingUsers = this.getStoredUsers();
    const userExists = existingUsers.some(user =>
      user.email === userData.email || user.username === userData.username
    );

    if (userExists) {
      return false; // User already exists
    }

    // Create new user with password
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };

    // Store user in localStorage
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    // Don't auto-login, let user login manually
    return true;
  }

  login(emailOrUsername: string, password: string): boolean {
    const users = this.getStoredUsers();
    const user = users.find(u =>
      (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    );

    if (user) {
      // Create a user object without password for security
      const userWithoutPassword = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        birthDate: user.birthDate
      };
      
      this.currentUserSubject.next(userWithoutPassword as User);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getStoredUsers(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }
}
