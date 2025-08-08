import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  showPassword = false;
  
  // Form data
  emailOrUsername = '';
  password = '';
  rememberMe = false;

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

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Basic validation
    if (!this.emailOrUsername || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Try to login the user
    const success = this.authService.login(this.emailOrUsername, this.password);

    if (success) {
      this.successMessage = 'Login successful! Redirecting to home...';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } else {
      this.errorMessage = 'Invalid email/username or password.';
    }
  }
}
