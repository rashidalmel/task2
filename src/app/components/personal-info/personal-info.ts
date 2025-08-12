import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.scss'
})
export class PersonalInfoComponent implements OnInit {
  currentUser: User | null = null;
  profileImage: string | null = null;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  // Form data for editing
  firstName = '';
  lastName = '';
  email = '';
  username = '';
  birthDate = '';
  selectedGenres: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.firstName = this.currentUser.firstName;
      this.lastName = this.currentUser.lastName;
      this.email = this.currentUser.email;
      this.username = this.currentUser.username;
      this.birthDate = this.currentUser.birthDate;
    }

    // Load profile image from localStorage (user-specific)
    const savedImage = localStorage.getItem(`profileImage_${this.currentUser?.id}`);
    if (savedImage) {
      this.profileImage = savedImage;
    }

    // Load selected genres from localStorage (user-specific)
    const savedGenres = localStorage.getItem(`userGenres_${this.currentUser?.id}`);
    if (savedGenres) {
      this.selectedGenres = JSON.parse(savedGenres);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMessage = 'Image size should be less than 5MB.';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        // Save profile image with user-specific key
        localStorage.setItem(`profileImage_${this.currentUser?.id}`, e.target.result);
        this.successMessage = 'Profile picture updated successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveChanges() {
    if (!this.firstName || !this.lastName || !this.email || !this.username || !this.birthDate) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Update user data in localStorage
    if (this.currentUser) {
      // Get the current user with password from storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUserWithPassword = users.find((u: User) => u.id === this.currentUser?.id);
      
      if (currentUserWithPassword) {
        const updatedUser = {
          ...currentUserWithPassword,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          username: this.username,
          birthDate: this.birthDate
        };

        // Update in users array (with password)
        const userIndex = users.findIndex((u: User) => u.id === this.currentUser?.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          localStorage.setItem('users', JSON.stringify(users));
        }

        // Update current user (without password for security)
        const userWithoutPassword = {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          username: updatedUser.username,
          birthDate: updatedUser.birthDate
        };

        this.currentUser = userWithoutPassword as User;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    }
  }

  cancelEdit() {
    if (this.currentUser) {
      this.firstName = this.currentUser.firstName;
      this.lastName = this.currentUser.lastName;
      this.email = this.currentUser.email;
      this.username = this.currentUser.username;
      this.birthDate = this.currentUser.birthDate;
    }
    this.isEditing = false;
    this.errorMessage = '';
  }

  toggleGenre(genre: string) {
    if (this.selectedGenres.includes(genre)) {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    } else {
      this.selectedGenres.push(genre);
    }
    // Save genres to localStorage (user-specific)
    localStorage.setItem(`userGenres_${this.currentUser?.id}`, JSON.stringify(this.selectedGenres));
  }

  getSelectedGenres(): string {
    return this.selectedGenres.join(', ');
  }

  getAge(): number {
    if (this.birthDate) {
      const today = new Date();
      const birthDate = new Date(this.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
    return 0;
  }
}
