import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent, Movie } from '../movie-card/movie-card';
import { TmdbService, Movie as TmdbMovie } from '../../services/tmdb.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MovieCardComponent],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit {
  searchTerm: string = '';
  selectedGenre: string = 'all';
  hasSearched: boolean = false;
  searchResults: Movie[] = [];
  isSearching: boolean = false;
  isLoading: boolean = true;
  
  // Featured movies from TMDB
  featuredMovies: Movie[] = [];

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

  loadFeaturedMovies() {
    this.isLoading = true;
    
    // Load trending movies as featured content
    this.tmdbService.getTrendingMovies().subscribe({
      next: (tmdbMovies: TmdbMovie[]) => {
        this.featuredMovies = this.convertTmdbToMovie(tmdbMovies);
        this.searchResults = this.featuredMovies;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured movies:', error);
        this.loadDummyMovies();
        this.isLoading = false;
      }
    });
  }

  // Convert TMDB movie format to our Movie interface
  convertTmdbToMovie(tmdbMovies: TmdbMovie[]): Movie[] {
    return tmdbMovies.map(tmdbMovie => ({
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      year: new Date(tmdbMovie.release_date).getFullYear(),
      rating: tmdbMovie.vote_average,
      posterUrl: this.tmdbService.getPosterUrl(tmdbMovie.poster_path, 'w500'),
      genre: 'Action, Drama' // You can get genres from TMDB if needed
    }));
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
        posterUrl: 'https://via.placeholder.com/300x450/007bff/ffffff?text=Shawshank',
        genre: 'Drama'
      },
      {
        id: 2,
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        year: 1972,
        rating: 9.2,
        posterUrl: 'https://via.placeholder.com/300x450/28a745/ffffff?text=Godfather',
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
    
    // Simulate slight delay for better UX (like Netflix)
    setTimeout(() => {
      this.performSearch();
      this.isSearching = false;
    }, 300);
  }

  performSearch() {
    if (!this.searchTerm.trim()) {
      this.searchResults = this.featuredMovies;
      this.hasSearched = false;
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    // Use TMDB API to search for movies
    this.tmdbService.searchMovies(this.searchTerm).subscribe({
      next: (response) => {
        this.searchResults = this.convertTmdbToMovie(response.results);
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  filterByGenre(genre: string) {
    this.selectedGenre = genre;
    
    if (this.searchTerm.trim()) {
      // If there's a search term, perform search with genre filter
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
  }
}
