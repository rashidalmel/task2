import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent, Movie } from '../movie-card/movie-card';
import { TmdbService, Movie as TmdbMovie } from '../../services/tmdb.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MovieCardComponent],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  selectedGenre: string = 'all';
  hasSearched: boolean = false;
  searchResults: Movie[] = [];
  isSearching: boolean = false;
  isLoading: boolean = true;
  
  // Featured movies from TMDB
  featuredMovies: Movie[] = [];
  
  private destroy$ = new Subject<void>();
  private currentSearchRequest: Subscription | null = null;

  constructor(
    private tmdbService: TmdbService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check for query parameter from header search
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
        this.performSearch();
      } else {
        this.loadFeaturedMovies();
      }
    });
  }

  ngOnDestroy() {
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeaturedMovies() {
    this.isLoading = true;
    
    // Load trending movies as featured content
    this.tmdbService.getTrendingMovies().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading featured movies:', error);
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (tmdbMovies: TmdbMovie[]) => {
        this.featuredMovies = this.convertTmdbToMovie(tmdbMovies);
        this.searchResults = this.featuredMovies;
      }
    });
  }

  // Convert TMDB movie format to our Movie interface
  convertTmdbToMovie(tmdbMovies: TmdbMovie[]): Movie[] {
    console.log('Converting TMDB movies:', tmdbMovies); // Debug log
    const converted = tmdbMovies.map(tmdbMovie => ({
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      year: new Date(tmdbMovie.release_date).getFullYear(),
      rating: tmdbMovie.vote_average,
      posterUrl: this.tmdbService.getPosterUrl(tmdbMovie.poster_path, 'w500'),
      genre: 'Action, Drama' // You can get genres from TMDB if needed
    }));
    console.log('Converted movies:', converted); // Debug log
    return converted;
  }

  // Fallback to dummy data if API fails
  loadDummyMovies() {
    this.featuredMovies = [
      {
        id: 1,
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        year: 1994,
        rating: 9.3,
        posterUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMDA3QkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2hhd3NoYW5rPC90ZXh0Pgo8L3N2Zz4=',
        genre: 'Drama'
      },
      {
        id: 2,
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        year: 1972,
        rating: 9.2,
        posterUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMjhBNzQ1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R29kZmF0aGVyPC90ZXh0Pgo8L3N2Zz4=',
        genre: 'Crime, Drama'
      }
    ];
    this.searchResults = this.featuredMovies;
  }

  onSearchInput() {
    // Real-time search as user types
    if (!this.searchTerm.trim()) {
      this.searchResults = this.featuredMovies;
      this.hasSearched = false;
      return;
    }

    this.hasSearched = true;
    this.isSearching = true;
    
    // Reduced delay for better responsiveness
    setTimeout(() => {
      this.performSearch();
      this.isSearching = false;
    }, 150); // Reduced from 300ms to 150ms
  }

  performSearch() {
    if (!this.searchTerm.trim()) {
      this.searchResults = this.featuredMovies;
      this.hasSearched = false;
      return;
    }

    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }

    this.isSearching = true;
    this.hasSearched = true;
    console.log('Performing search for:', this.searchTerm); // Debug log

    // Use TMDB API to search for movies
    this.currentSearchRequest = this.tmdbService.searchMovies(this.searchTerm).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error searching movies:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSearching = false;
      })
    ).subscribe({
      next: (response) => {
        console.log('Search response:', response); // Debug log
        if (response && response.results) {
          this.searchResults = this.convertTmdbToMovie(response.results);
          console.log('Final search results:', this.searchResults); // Debug log
        } else {
          this.searchResults = [];
          console.log('No search results found'); // Debug log
        }
      }
    });
  }

  filterByGenre(genre: string) {
    this.selectedGenre = genre;
    
    if (this.searchTerm.trim()) {
      // If there's a search term, perform search with genre filter
      // Cancel any ongoing request first
      if (this.currentSearchRequest) {
        this.currentSearchRequest.unsubscribe();
      }
      this.performSearch();
    } else {
      // If no search term, show featured movies filtered by genre
      if (genre === 'all') {
        this.searchResults = this.featuredMovies;
      } else {
        this.searchResults = this.featuredMovies.filter(movie => 
          movie.genre?.toLowerCase().includes(genre)
        );
      }
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedGenre = 'all';
    this.hasSearched = false;
    this.searchResults = this.featuredMovies;
    
    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
      this.currentSearchRequest = null;
    }
  }
}
