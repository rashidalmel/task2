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
  topRatedMovies: Movie[] = [];
  upcomingMovies: Movie[] = [];
  allMovies: Movie[] = [];
  
  // Popular movies collection
  popularMovies: Movie[] = [];

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

    // Load popular movies for popular section
    this.tmdbService.getPopularMovies().subscribe({
      next: (response) => {
        this.popularMovies = this.convertTmdbToMovie(response.results);
        this.allMovies = [...this.allMovies, ...this.popularMovies];
      },
      error: (error) => {
        console.error('Error loading popular movies:', error);
      }
    });

    // Load upcoming movies from TMDB
    this.tmdbService.getUpcomingMovies().subscribe({
      next: (response) => {
        this.upcomingMovies = this.convertTmdbToMovie(response.results);
        this.allMovies = [...this.allMovies, ...this.upcomingMovies];
      },
      error: (error) => {
        console.error('Error loading upcoming movies:', error);
      }
    });

    // Load top rated movies from TMDB
    this.tmdbService.getTopRatedMovies().subscribe({
      next: (response) => {
        this.topRatedMovies = this.convertTmdbToMovie(response.results);
        this.allMovies = [...this.allMovies, ...this.topRatedMovies];
      },
      error: (error) => {
        console.error('Error loading top rated movies:', error);
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
    this.upcomingMovies = this.allMovies;
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

  navigateToPopular() {
    // Navigate to search page with popular filter
    this.router.navigate(['/search']);
  }

  loadMoreMovies() {
    // Load more upcoming movies
    this.tmdbService.getUpcomingMovies(2).subscribe({
      next: (response) => {
        const newMovies = this.convertTmdbToMovie(response.results);
        this.upcomingMovies.push(...newMovies);
        this.allMovies.push(...newMovies);
      },
      error: (error) => {
        console.error('Error loading more movies:', error);
      }
    });
  }
}
