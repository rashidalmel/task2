import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent, Movie } from '../movie-card/movie-card';
import { AuthService } from '../../services/auth.service';
import { TmdbService, Movie as TmdbMovie } from '../../services/tmdb.service';
import { forkJoin, catchError, of } from 'rxjs';

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
    
    // Load all movie collections in parallel using forkJoin for better performance
    forkJoin({
      trending: this.tmdbService.getTrendingMovies().pipe(
        catchError(error => {
          console.error('Error loading trending movies:', error);
          return of([]);
        })
      ),
      popular: this.tmdbService.getPopularMovies().pipe(
        catchError(error => {
          console.error('Error loading popular movies:', error);
          return of({ results: [] });
        })
      ),
      upcoming: this.tmdbService.getUpcomingMovies().pipe(
        catchError(error => {
          console.error('Error loading upcoming movies:', error);
          return of({ results: [] });
        })
      ),
      topRated: this.tmdbService.getTopRatedMovies().pipe(
        catchError(error => {
          console.error('Error loading top rated movies:', error);
          return of({ results: [] });
        })
      )
    }).subscribe({
      next: (results) => {
        // Process trending movies
        if (results.trending && results.trending.length > 0) {
          this.trendingMovies = this.convertTmdbToMovie(results.trending);
          this.allMovies = [...this.trendingMovies];
        }
        
        // Process popular movies
        if (results.popular && results.popular.results) {
          this.popularMovies = this.convertTmdbToMovie(results.popular.results);
          this.allMovies = [...this.allMovies, ...this.popularMovies];
        }
        
        // Process upcoming movies
        if (results.upcoming && results.upcoming.results) {
          this.upcomingMovies = this.convertTmdbToMovie(results.upcoming.results);
          this.allMovies = [...this.allMovies, ...this.upcomingMovies];
        }
        
        // Process top rated movies
        if (results.topRated && results.topRated.results) {
          this.topRatedMovies = this.convertTmdbToMovie(results.topRated.results);
          this.allMovies = [...this.allMovies, ...this.topRatedMovies];
        }
        
        // If no movies loaded, fallback to dummy data
        if (this.allMovies.length === 0) {
          this.loadDummyMovies();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
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
    this.allMovies = [
      {
        id: 1,
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        year: 2008,
        rating: 9.0,
        posterUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjNkM3NTdEIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RGFyayBLbmlnaHQ8L3RleHQ+Cjwvc3ZnPg==',
        genre: 'Action, Crime, Drama'
      },
      {
        id: 2,
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        year: 2010,
        rating: 8.8,
        posterUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTdBMkI4Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW5jZXB0aW9uPC90ZXh0Pgo8L3N2Zz4=',
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
