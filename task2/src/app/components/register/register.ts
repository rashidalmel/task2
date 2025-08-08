import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  
  // Form data
  firstName = '';
  lastName = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  birthDate = '';

  // Error handling
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    if (confirmPasswordInput) {
      confirmPasswordInput.type = this.showConfirmPassword ? 'text' : 'password';
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.firstName || !this.lastName || !this.email || !this.username || !this.password || !this.birthDate) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    // Try to register the user
    const success = this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.username,
      birthDate: this.birthDate,
      password: this.password
    });

    if (success) {
      this.successMessage = 'Registration successful! Redirecting to login...';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      this.errorMessage = 'User with this email or username already exists.';
    }
  }
}
