import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { TmdbService, Movie as TmdbMovie } from '../../services/tmdb.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoggedIn = false;
  currentUser: User | null = null;
  private authSubscription: Subscription | null = null;
  
  // Search properties
  searchTerm: string = '';
  searchResults: TmdbMovie[] = [];
  isSearching: boolean = false;
  showSearchResults: boolean = false;
  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private tmdbService: TmdbService
  ) {
    // Setup search with debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim()) {
          this.isSearching = true;
          return this.tmdbService.searchMovies(query);
        } else {
          this.searchResults = [];
          this.showSearchResults = false;
          return [];
        }
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.searchResults = response.results.slice(0, 8); // Limit to 8 results
          this.showSearchResults = this.searchResults.length > 0;
        }
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults = [];
        this.showSearchResults = false;
        this.isSearching = false;
      }
    });
  }

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = user !== null;
      this.currentUser = user;
    });
  }

  ngAfterViewInit() {
    // Initialize Bootstrap dropdowns
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdownToggleEl => {
      new bootstrap.Dropdown(dropdownToggleEl);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  // Search methods
  onSearchInput() {
    if (this.searchTerm.trim()) {
      this.searchSubject.next(this.searchTerm);
    } else {
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }

  performSearch() {
    if (this.searchTerm.trim()) {
      this.searchSubject.next(this.searchTerm);
    }
  }

  onSearchFocus() {
    if (this.searchResults.length > 0) {
      this.showSearchResults = true;
    }
  }

  onSearchBlur() {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  selectSearchResult(movie: TmdbMovie) {
    this.searchTerm = '';
    this.showSearchResults = false;
    this.router.navigate(['/search'], { queryParams: { q: movie.title } });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  getPosterUrl(path: string): string {
    return this.tmdbService.getPosterUrl(path, 'w92');
  }
}
