import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { TmdbService, Movie as TmdbMovie } from '../../services/tmdb.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, finalize } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

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
  private destroy$ = new Subject<void>();
  private currentSearchRequest: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tmdbService: TmdbService
  ) {
    // Setup search with debouncing for real-time search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performRealTimeSearch(query);
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
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
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
      this.clearSearchResults();
    }
  }

  performSearch() {
    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }

    if (this.searchTerm.trim()) {
      // For Enter key, perform immediate search without debouncing
      this.performImmediateSearch(this.searchTerm);
    }
  }

  private performRealTimeSearch(query: string) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }

    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }

    this.isSearching = true;
    this.showSearchResults = false;

    this.currentSearchRequest = this.tmdbService.searchMovies(query).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Search error:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSearching = false;
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.searchResults = response.results.slice(0, 6); // Limit to 6 results for better performance
          this.showSearchResults = this.searchResults.length > 0;
        } else {
          this.searchResults = [];
          this.showSearchResults = false;
        }
      }
    });
  }

  private performImmediateSearch(query: string) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }

    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }

    this.isSearching = true;
    this.showSearchResults = false;

    this.currentSearchRequest = this.tmdbService.searchMovies(query).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Search error:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSearching = false;
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.results) {
          this.searchResults = response.results.slice(0, 6);
          this.showSearchResults = this.searchResults.length > 0;
        } else {
          this.searchResults = [];
          this.showSearchResults = false;
        }
      }
    });
  }

  onSearchFocus() {
    if (this.searchResults.length > 0 && !this.isSearching) {
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
    
    // Ensure movie has an ID before navigating
    if (movie && movie.id) {
      // Navigate directly to movie detail page
      this.router.navigate(['/movie', movie.id]);
    } else {
      console.error('Movie ID is missing:', movie);
      // Fallback to search page if no ID
      this.router.navigate(['/search'], { queryParams: { q: movie.title } });
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.clearSearchResults();
  }

  private clearSearchResults() {
    this.searchResults = [];
    this.showSearchResults = false;
    this.isSearching = false;
    
    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
      this.currentSearchRequest = null;
    }
  }

  navigateToSearch() {
    // Ensure search term is properly set before navigation
    if (this.searchTerm && this.searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm.trim() } });
      // Hide search results after navigation
      this.showSearchResults = false;
    } else {
      // If no search term, just navigate to search page
      this.router.navigate(['/search']);
    }
  }

  getPosterUrl(path: string): string {
    // Use smaller image size for better performance in dropdown
    return this.tmdbService.getPosterUrl(path, 'w92');
  }
}
