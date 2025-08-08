import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent, Movie } from '../movie-card/movie-card';
import { AuthService } from '../../services/auth.service';
import { TmdbService, Movie as TmdbMovie } from '../../services/tmdb.service';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MovieCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  isLoading: boolean = true;
  
  // Movie collections
  trendingMovies: Movie[] = [];
  continueWatching: Movie[] = [];
  featuredMovies: Movie[] = [];
  allMovies: Movie[] = [];
  
  // Categories
  categories: Category[] = [
    { id: 'action', name: 'Action', icon: 'fas fa-fire', count: 150 },
    { id: 'drama', name: 'Drama', icon: 'fas fa-theater-masks', count: 200 },
    { id: 'comedy', name: 'Comedy', icon: 'fas fa-laugh', count: 120 },
    { id: 'horror', name: 'Horror', icon: 'fas fa-ghost', count: 80 },
    { id: 'sci-fi', name: 'Sci-Fi', icon: 'fas fa-rocket', count: 60 },
    { id: 'romance', name: 'Romance', icon: 'fas fa-heart', count: 90 }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private tmdbService: TmdbService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadMovies();
  }

  loadMovies() {
    this.isLoading = true;
    
    // Load trending movies from TMDB
    this.tmdbService.getTrendingMovies().subscribe({
      next: (tmdbMovies: TmdbMovie[]) => {
        this.trendingMovies = this.convertTmdbToMovie(tmdbMovies);
        this.allMovies = [...this.trendingMovies];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trending movies:', error);
        this.loadDummyMovies(); // Fallback to dummy data
        this.isLoading = false;
      }
    });

    // Load popular movies for featured section
    this.tmdbService.getPopularMovies().subscribe({
      next: (response) => {
        this.featuredMovies = this.convertTmdbToMovie(response.results);
        this.allMovies = [...this.allMovies, ...this.featuredMovies];
      },
      error: (error) => {
        console.error('Error loading popular movies:', error);
      }
    });

    // Continue watching (if logged in) - using dummy data for now
    if (this.isLoggedIn) {
      this.continueWatching = [
        {
          id: 5,
          title: 'Fight Club',
          description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
          year: 1999,
          rating: 8.8,
          posterUrl: 'https://via.placeholder.com/300x450/ffc107/000000?text=Fight+Club',
          genre: 'Drama'
        },
        {
          id: 6,
          title: 'Goodfellas',
          description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
          year: 1990,
          rating: 8.7,
          posterUrl: 'https://via.placeholder.com/300x450/fd7e14/ffffff?text=Goodfellas',
          genre: 'Biography, Crime, Drama'
        }
      ];
    }
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
    this.allMovies = [
      {
        id: 1,
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        year: 2008,
        rating: 9.0,
        posterUrl: 'https://via.placeholder.com/300x450/6c757d/ffffff?text=Dark+Knight',
        genre: 'Action, Crime, Drama'
      },
      {
        id: 2,
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        year: 2010,
        rating: 8.8,
        posterUrl: 'https://via.placeholder.com/300x450/17a2b8/ffffff?text=Inception',
        genre: 'Action, Adventure, Sci-Fi'
      }
    ];
    this.trendingMovies = this.allMovies;
    this.featuredMovies = this.allMovies;
  }

  filterByCategory(category: string) {
    if (category === 'trending') {
      // Navigate to search page with trending filter
      this.router.navigate(['/search']);
    } else {
      // Navigate to search page with category filter
      this.router.navigate(['/search']);
    }
  }

  navigateToCategory(category: Category) {
    // Navigate to search page with category filter
    this.router.navigate(['/search']);
  }

  loadMoreMovies() {
    // Load more popular movies
    this.tmdbService.getPopularMovies(2).subscribe({
      next: (response) => {
        const newMovies = this.convertTmdbToMovie(response.results);
        this.featuredMovies.push(...newMovies);
        this.allMovies.push(...newMovies);
      },
      error: (error) => {
        console.error('Error loading more movies:', error);
      }
    });
  }
}
