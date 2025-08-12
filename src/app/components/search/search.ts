import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent, Movie } from '../movie-card/movie-card';
import { TmdbService, Movie as TmdbMovie, Genre } from '../../services/tmdb.service';
import { ToastService } from '../../services/toast.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    MovieCardComponent, 
    ProgressSpinnerModule,
    MultiSelectModule,
    SliderModule,
    SelectModule,
    ButtonModule,
    CardModule,
    DividerModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  selectedGenre: string = 'all';
  hasSearched: boolean = false;
  searchResults: Movie[] = [];
  filteredResults: Movie[] = [];
  isSearching: boolean = false;
  isLoading: boolean = true;
  
  // Featured movies from TMDB
  featuredMovies: Movie[] = [];
  
  // Filter properties
  availableGenres: Genre[] = [];
  selectedGenres: Genre[] = [];
  currentYear: number = new Date().getFullYear();
  selectedYear: number = 0; // 0 means "All Years"
  selectedRating: number = 0; // 0 means "All Ratings"
  sortBy: string = 'relevance';
  
  // Sort options
  sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Title A-Z', value: 'title_asc' },
    { label: 'Title Z-A', value: 'title_desc' },
    { label: 'Year (Newest)', value: 'year_desc' },
    { label: 'Year (Oldest)', value: 'year_asc' },
    { label: 'Rating (High to Low)', value: 'rating_desc' },
    { label: 'Rating (Low to High)', value: 'rating_asc' }
  ];
  
  // Year options for dropdown
  yearOptions = [
    { label: 'All Years', value: 0 },
    { label: '2024', value: 2024 },
    { label: '2023', value: 2023 },
    { label: '2022', value: 2022 },
    { label: '2021', value: 2021 },
    { label: '2020', value: 2020 },
    { label: '2019', value: 2019 },
    { label: '2018', value: 2018 },
    { label: '2017', value: 2017 },
    { label: '2016', value: 2016 },
    { label: '2015', value: 2015 },
    { label: '2014', value: 2014 },
    { label: '2013', value: 2013 },
    { label: '2012', value: 2012 },
    { label: '2011', value: 2011 },
    { label: '2010', value: 2010 },
    { label: '2009', value: 2009 },
    { label: '2008', value: 2008 },
    { label: '2007', value: 2007 },
    { label: '2006', value: 2006 },
    { label: '2005', value: 2005 },
    { label: '2004', value: 2004 },
    { label: '2003', value: 2003 },
    { label: '2002', value: 2002 },
    { label: '2001', value: 2001 },
    { label: '2000', value: 2000 },
    { label: '1999', value: 1999 },
    { label: '1998', value: 1998 },
    { label: '1997', value: 1997 },
    { label: '1996', value: 1996 },
    { label: '1995', value: 1995 },
    { label: '1994', value: 1994 },
    { label: '1993', value: 1993 },
    { label: '1992', value: 1992 },
    { label: '1991', value: 1991 },
    { label: '1990', value: 1990 },
    { label: '1989', value: 1989 },
    { label: '1988', value: 1988 },
    { label: '1987', value: 1987 },
    { label: '1986', value: 1986 },
    { label: '1985', value: 1985 },
    { label: '1984', value: 1984 },
    { label: '1983', value: 1983 },
    { label: '1982', value: 1982 },
    { label: '1981', value: 1981 },
    { label: '1980', value: 1980 }
  ];
  
  // Rating options for dropdown
  ratingOptions = [
    { label: 'All Ratings', value: 0 },
    { label: '9.0+ (Excellent)', value: 9.0 },
    { label: '8.0+ (Very Good)', value: 8.0 },
    { label: '7.0+ (Good)', value: 7.0 },
    { label: '6.0+ (Fair)', value: 6.0 },
    { label: '5.0+ (Average)', value: 5.0 },
    { label: '4.0+ (Below Average)', value: 4.0 },
    { label: '3.0+ (Poor)', value: 3.0 },
    { label: '2.0+ (Very Poor)', value: 2.0 },
    { label: '1.0+ (Terrible)', value: 1.0 }
  ];
  
  // Pagination properties
  currentPage: number = 1;
  moviesPerPage: number = 40;
  totalPages: number = 1;
  hasMorePages: boolean = false;
  isLoadingMore: boolean = false;
  
  private destroy$ = new Subject<void>();
  private currentSearchRequest: Subscription | null = null;

  constructor(
    private tmdbService: TmdbService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Initialize current year
    this.currentYear = new Date().getFullYear();
    
    console.log('Component initialized with current year:', this.currentYear);
    
    // Load available genres
    this.loadGenres();
    
    // Check for query parameter from header search
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
        this.hasSearched = true; // Set this to true when coming from header search
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

  loadGenres() {
    this.tmdbService.getGenres().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading genres:', error);
        this.toastService.showError('Failed to load genres. Please try again later.', 'Loading Error');
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.genres) {
          this.availableGenres = response.genres;
        }
      }
    });
  }

  loadFeaturedMovies() {
    this.isLoading = true;
    
    // Load multiple pages of trending movies to get more content initially
    const page1$ = this.tmdbService.getTrendingMoviesFiltered('week', 1);
    const page2$ = this.tmdbService.getTrendingMoviesFiltered('week', 2);
    const page3$ = this.tmdbService.getTrendingMoviesFiltered('week', 3);
    
    // Combine all three pages
    page1$.pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading featured movies page 1:', error);
        return of([]);
      })
    ).subscribe({
      next: (page1Movies: TmdbMovie[]) => {
        // Load second page
        page2$.pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            console.error('Error loading featured movies page 2:', error);
            return of([]);
          })
        ).subscribe({
          next: (page2Movies: TmdbMovie[]) => {
            // Load third page
            page3$.pipe(
              takeUntil(this.destroy$),
              catchError(error => {
                console.error('Error loading featured movies page 3:', error);
                return of([]);
              }),
              finalize(() => {
                this.isLoading = false;
              })
            ).subscribe({
              next: (page3Movies: TmdbMovie[]) => {
                // Combine all three pages
                const allMovies = [...page1Movies, ...page2Movies, ...page3Movies];
                this.featuredMovies = this.convertTmdbToMovie(allMovies);
                this.searchResults = this.featuredMovies;
                this.applyFilters();
                this.calculateTotalPages();
              }
            });
          }
        });
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
      genre: this.getGenreNames(tmdbMovie.genre_ids)
    }));
    console.log('Converted movies:', converted); // Debug log
    return converted;
  }

  // Get genre names from genre IDs
  getGenreNames(genreIds: number[]): string {
    if (!genreIds || genreIds.length === 0) return 'Unknown';
    
    const genreNames = genreIds
      .map(id => this.availableGenres.find(g => g.id === id)?.name)
      .filter(name => name)
      .join(', ');
    
    return genreNames || 'Unknown';
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
    this.applyFilters();
  }

  onSearchInput() {
    // Real-time search as user types
    if (!this.searchTerm.trim()) {
      this.searchResults = this.featuredMovies;
      this.hasSearched = false;
      this.applyFilters();
      return;
    }

    this.hasSearched = true;
    
    // Use debounced search instead of immediate state changes
    setTimeout(() => {
      this.performSearch();
    }, 300); // Increased delay for better debouncing
  }

  performSearch() {
    if (!this.searchTerm.trim()) {
      this.searchResults = this.featuredMovies;
      this.hasSearched = false;
      this.applyFilters();
      return;
    }

    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
    }

    this.isSearching = true;
    this.hasSearched = true;
    console.log('=== SEARCH START ===');
    console.log('Search Term:', this.searchTerm);
    console.log('Is Searching:', this.isSearching);
    console.log('Has Searched:', this.hasSearched);
    console.log('Current Results Count:', this.searchResults.length);

    // Use TMDB API to search for movies
    this.currentSearchRequest = this.tmdbService.searchMoviesFiltered(this.searchTerm).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error searching movies:', error);
        this.toastService.showError('Failed to search movies. Please try again later.', 'Search Error');
        return of(null);
      }),
      finalize(() => {
        this.isSearching = false;
        console.log('=== SEARCH COMPLETED ===');
        console.log('Is Searching set to:', this.isSearching);
        console.log('Final Results Count:', this.searchResults.length);
        console.log('Has Searched:', this.hasSearched);
      })
    ).subscribe({
      next: (response) => {
        console.log('=== SEARCH RESPONSE ===');
        console.log('Raw response:', response);
        if (response && response.results) {
          console.log('Response has results, count:', response.results.length);
          this.searchResults = this.convertTmdbToMovie(response.results);
          console.log('Converted results count:', this.searchResults.length);
          console.log('First result:', this.searchResults[0]);
          this.applyFilters();
          this.calculateTotalPages();
        } else {
          console.log('No results in response');
          this.searchResults = [];
          this.filteredResults = [];
        }
      },
      error: (error) => {
        console.error('Search subscription error:', error);
        this.searchResults = [];
        this.filteredResults = [];
      }
    });
  }

  // Apply all filters to the current search results
  applyFilters() {
    console.log('=== APPLYING FILTERS ===');
    console.log('Original search results:', this.searchResults.length);
    console.log('Selected genres:', this.selectedGenres);
    console.log('Selected year:', this.selectedYear);
    console.log('Selected rating:', this.selectedRating);
    console.log('Sort by:', this.sortBy);

    let filtered = [...this.searchResults];

    // Filter by selected genres
    if (this.selectedGenres && this.selectedGenres.length > 0) {
      const beforeGenreFilter = filtered.length;
      filtered = filtered.filter(movie => {
        const movieGenres = movie.genre?.toLowerCase().split(', ') || [];
        const hasMatchingGenre = this.selectedGenres.some(selectedGenre => 
          movieGenres.includes(selectedGenre.name.toLowerCase())
        );
        return hasMatchingGenre;
      });
      console.log(`Genre filter: ${beforeGenreFilter} -> ${filtered.length} movies`);
    }

    // Filter by selected year
    if (this.selectedYear > 0) {
      const beforeYearFilter = filtered.length;
      filtered = filtered.filter(movie => movie.year === this.selectedYear);
      console.log(`Year filter: ${beforeYearFilter} -> ${filtered.length} movies`);
    }

    // Filter by selected rating
    if (this.selectedRating > 0) {
      const beforeRatingFilter = filtered.length;
      filtered = filtered.filter(movie => movie.rating >= this.selectedRating);
      console.log(`Rating filter: ${beforeRatingFilter} -> ${filtered.length} movies`);
    }

    // Sort results
    filtered = this.sortResults(filtered);

    this.filteredResults = filtered;
    console.log('Final filtered results:', this.filteredResults.length);
    console.log('=== FILTERS APPLIED ===');
    
    // Reset pagination when filters change
    this.resetPagination();
  }

  // Sort results based on selected sort option
  sortResults(movies: Movie[]): Movie[] {
    const sorted = [...movies];
    
    switch (this.sortBy) {
      case 'title_asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'year_desc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'year_asc':
        return sorted.sort((a, b) => a.year - b.year);
      case 'rating_desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating_asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted; // relevance - keep original order
    }
  }

  // Filter change handlers
  onGenreChange() {
    console.log('Genre changed:', this.selectedGenres);
    this.applyFilters();
  }

  onYearChange() {
    console.log('Year changed to:', this.selectedYear);
    this.applyFilters();
  }

  onRatingChange() {
    console.log('Rating changed to:', this.selectedRating);
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  // Clear all filters
  clearFilters() {
    this.selectedGenres = [];
    this.selectedYear = 0;
    this.selectedRating = 0;
    this.sortBy = 'relevance';
    this.applyFilters();
  }

  // Test filters method for debugging
  testFilters() {
    console.log('=== TESTING FILTERS ===');
    console.log('Current selected year:', this.selectedYear);
    console.log('Current selected rating:', this.selectedRating);
    console.log('Current selected genres:', this.selectedGenres);
    console.log('Current sort by:', this.sortBy);
    
    // Test changing year
    this.selectedYear = 2005;
    console.log('Changed year to:', this.selectedYear);
    
    // Test with some sample data if no movies exist
    if (this.searchResults.length === 0) {
      console.log('No movies found, creating sample data for testing...');
      this.searchResults = [
        {
          id: 1,
          title: 'Test Movie 1',
          description: 'A test movie from 2005',
          year: 2005,
          rating: 7.5,
          posterUrl: '',
          genre: 'Action, Drama'
        },
        {
          id: 2,
          title: 'Test Movie 2',
          description: 'A test movie from 2015',
          year: 2015,
          rating: 8.2,
          posterUrl: '',
          genre: 'Comedy'
        },
        {
          id: 3,
          title: 'Test Movie 3',
          description: 'A test movie from 1995',
          year: 1995,
          rating: 6.8,
          posterUrl: '',
          genre: 'Thriller'
        }
      ];
    }
    
    this.applyFilters();
  }

  // Legacy genre filter (keeping for backward compatibility)
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
      this.applyFilters();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedGenre = 'all';
    this.selectedGenres = [];
    this.selectedYear = 0;
    this.selectedRating = 0;
    this.sortBy = 'relevance';
    this.hasSearched = false;
    this.searchResults = this.featuredMovies;
    this.applyFilters();
    
    // Cancel any ongoing search request
    if (this.currentSearchRequest) {
      this.currentSearchRequest.unsubscribe();
      this.currentSearchRequest = null;
    }
  }

  // Get display results (either filtered or original)
  get displayResults(): Movie[] {
    return this.filteredResults.length > 0 ? this.filteredResults : this.searchResults;
  }

  // Get results count for display
  get resultsCount(): number {
    return this.displayResults.length;
  }

  // Pagination methods
  get paginatedResults(): Movie[] {
    const startIndex = (this.currentPage - 1) * this.moviesPerPage;
    const endIndex = startIndex + this.moviesPerPage;
    return this.displayResults.slice(startIndex, endIndex);
  }

  get totalResultsCount(): number {
    return this.displayResults.length;
  }

  // Calculate total pages based on filtered results
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalResultsCount / this.moviesPerPage);
    this.hasMorePages = this.currentPage < this.totalPages;
  }

  // Load more movies (next page)
  loadMoreMovies() {
    if (this.hasMorePages && !this.isLoadingMore) {
      this.isLoadingMore = true;
      this.currentPage++;
      this.calculateTotalPages();
      
      // Simulate loading delay
      setTimeout(() => {
        this.isLoadingMore = false;
      }, 500);
    }
  }

  // Load more movies from API (for featured movies)
  loadMoreFromAPI() {
    if (!this.isLoadingMore) {
      this.isLoadingMore = true;
      
      // Calculate next page to load
      const nextPage = Math.floor(this.featuredMovies.length / 20) + 1;
      
      this.tmdbService.getTrendingMoviesFiltered('week', nextPage).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading more movies from API:', error);
          this.toastService.showError('Failed to load more movies. Please try again later.', 'Loading Error');
          return of([]);
        }),
        finalize(() => {
          this.isLoadingMore = false;
        })
      ).subscribe({
        next: (newMovies: TmdbMovie[]) => {
          if (newMovies.length > 0) {
            const convertedNewMovies = this.convertTmdbToMovie(newMovies);
            this.featuredMovies = [...this.featuredMovies, ...convertedNewMovies];
            this.searchResults = this.featuredMovies;
            this.applyFilters();
            this.calculateTotalPages();
            this.toastService.showSuccess(`Loaded ${newMovies.length} more movies!`, 'Success');
          }
        }
      });
    }
  }

  // Go to specific page
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.calculateTotalPages();
    }
  }

  // Previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.calculateTotalPages();
    }
  }

  // Next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.calculateTotalPages();
    }
  }

  // Reset pagination when filters change
  resetPagination() {
    this.currentPage = 1;
    this.calculateTotalPages();
  }
}
