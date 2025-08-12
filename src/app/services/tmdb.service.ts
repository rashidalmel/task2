import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: any[];
  production_countries: any[];
  spoken_languages: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;
  private readonly imageBaseUrl = environment.tmdbImageBaseUrl;
  private hasShownFilterNotification = false; // Track notification to avoid spam

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  // Get trending movies
  getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Observable<Movie[]> {
    const url = `${this.baseUrl}/trending/movie/${timeWindow}`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('page', page.toString())
    }).pipe(
      timeout(5000), // Reduced timeout to 5 seconds for better UX
      map(response => response.results),
      catchError(error => {
        console.error('Timeout or error getting trending movies:', error);
        return of([]);
      })
    );
  }

  // Get popular movies
  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/popular`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('page', page.toString())
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Timeout or error getting popular movies:', error);
        return of(null as any);
      })
    );
  }

  // Get top rated movies
  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/top_rated`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('page', page.toString())
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Timeout or error getting top rated movies:', error);
        return of(null as any);
      })
    );
  }

  // Get now playing movies
  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/now_playing`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('page', page.toString())
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Timeout or error getting now playing movies:', error);
        return of(null as any);
      })
    );
  }

  // Get upcoming movies
  getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/upcoming`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('page', page.toString())
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Timeout or error getting upcoming movies:', error);
        return of(null as any);
      })
    );
  }

  // Search movies
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/search/movie`;
    console.log('TMDB Service - Searching movies with query:', query); // Debug log
    console.log('TMDB Service - Full URL:', url); // Debug log
    console.log('TMDB Service - API Key length:', this.apiKey ? this.apiKey.length : 'undefined'); // Debug log
    
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString());
    
    console.log('TMDB Service - Search params:', params.toString()); // Debug log
    
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: params
    }).pipe(
      timeout(5000), // Reduced timeout to 5 seconds for better UX
      catchError(error => {
        console.error('TMDB Service - Search error:', error);
        console.error('TMDB Service - Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        return of(null as any);
      })
    );
  }

  // Get movie details
  getMovieDetails(movieId: number): Observable<MovieDetails> {
    const url = `${this.baseUrl}/movie/${movieId}`;
    console.log('TMDB Service - Getting movie details from:', url); // Debug log
    return this.http.get<MovieDetails>(url, { headers: this.getHeaders() })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('Timeout or error getting movie details:', error);
          return of(null as any);
        })
      );
  }

  // Get movies by genre
  getMoviesByGenre(genreId: number, page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/discover/movie`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('with_genres', genreId.toString())
        .set('page', page.toString())
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Timeout or error getting movies by genre:', error);
        return of(null as any);
      })
    );
  }

  // Get genres
  getGenres(): Observable<{ genres: Genre[] }> {
    const url = `${this.baseUrl}/genre/movie/list`;
    return this.http.get<{ genres: Genre[] }>(url, { headers: this.getHeaders() })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('Timeout or error getting genres:', error);
          return of(null as any);
        })
      );
  }

  // Get movie recommendations
  getMovieRecommendations(movieId: number, page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/${movieId}/recommendations`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('page', page.toString())
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Timeout or error getting movie recommendations:', error);
        return of(null as any);
      })
    );
  }

  // Get movie credits (cast and crew)
  getMovieCredits(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/credits`;
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('Timeout or error getting movie credits:', error);
          return of(null as any);
        })
      );
  }

  // Get movie videos (trailers, etc.)
  getMovieVideos(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/videos`;
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('Timeout or error getting movie videos:', error);
          return of(null as any);
        })
      );
  }

  // Get movie images
  getMovieImages(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/images`;
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('Timeout or error getting movie images:', error);
          return of(null as any);
        })
      );
  }

  // Helper method to calculate user age
  private getUserAge(): number {
    const user = this.authService.getCurrentUser();
    if (!user || !user.birthDate) {
      return 18; // Default to adult age if no user or birth date
    }

    const today = new Date();
    const birthDate = new Date(user.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Helper method to filter movies based on user age
  private filterMoviesByAge(movies: Movie[]): Movie[] {
    const userAge = this.getUserAge();
    
    // If user is 18 or older, return all movies
    if (userAge >= 18) {
      return movies;
    }
    
    // Define restricted genres for different age groups
    const restrictedGenresUnder13 = [27, 53, 80]; // Horror, Thriller, Crime
    const restrictedGenresUnder16 = [27]; // Horror only
    
    // Enhanced mature keywords - more comprehensive
    const matureKeywords = [
      'kill', 'murder', 'death', 'blood', 'violent', 'war', 'revenge', 
      'assassin', 'mafia', 'drug', 'gangster', 'serial', 'torture',
      'massacre', 'slaughter', 'brutal', 'savage', 'deadly'
    ];

    // Specific adult content keywords that should be filtered for under 18
    const adultContentKeywords = [
      'adult', 'mature', 'erotic', 'xxx', 'sex', 'porn', 'nude', 'naked',
      'explicit', 'sexual', 'seduction', 'lust', 'passion', 'desire',
      'intimate', 'sensual', '18+', 'adults only', 'not for children',
      'rated r', 'unrated', 'director\'s cut'
    ];
    
    // If user is under 18, apply comprehensive filtering
    const filteredMovies = movies.filter(movie => {
      // Filter out explicit adult content
      if (movie.adult) {
        console.log(`Movie: ${movie.title} - FILTERED: Adult content flag`);
        return false;
      }
      
      // Age-specific genre filtering
      if (userAge < 13 && movie.genre_ids.some(id => restrictedGenresUnder13.includes(id))) {
        console.log(`Movie: ${movie.title} - FILTERED: Restricted genre for under 13`);
        return false;
      }
      
      if (userAge < 16 && movie.genre_ids.some(id => restrictedGenresUnder16.includes(id))) {
        console.log(`Movie: ${movie.title} - FILTERED: Horror genre for under 16`);
        return false;
      }
      
      // Content-based filtering using title and overview
      const titleLower = movie.title.toLowerCase();
      const overviewLower = (movie.overview || '').toLowerCase();
      
      // Check for specific adult content keywords (stricter for under 18)
      const hasAdultContent = adultContentKeywords.some(keyword => 
        titleLower.includes(keyword) || overviewLower.includes(keyword)
      );
      
      if (hasAdultContent) {
        console.log(`Movie: ${movie.title} - FILTERED: Contains adult content keywords`);
        return false;
      }
      
      // Check for general mature content
      const hasMatureContent = matureKeywords.some(keyword => 
        titleLower.includes(keyword) || overviewLower.includes(keyword)
      );
      
      if (hasMatureContent) {
        console.log(`Movie: ${movie.title} - FILTERED: Contains mature content keywords`);
        return false;
      }
      
      // Rating-based filtering (low-rated movies often have mature content)
      if (userAge < 16 && movie.vote_average > 0 && movie.vote_average < 4.0) {
        console.log(`Movie: ${movie.title} - FILTERED: Low rating (${movie.vote_average}) potentially inappropriate`);
        return false;
      }
      
      // Popularity-based filtering for very young users (unpopular movies might be niche/mature)
      if (userAge < 13 && movie.popularity < 5.0) {
        console.log(`Movie: ${movie.title} - FILTERED: Low popularity for very young users`);
        return false;
      }
      
      console.log(`Movie: ${movie.title} - ALLOWED: Passed all age filters`);
      return true;
    });
    
    // Show filtering summary for users under 18
    if (userAge < 18 && movies.length - filteredMovies.length > 0) {
      const filteredCount = movies.length - filteredMovies.length;
      console.log(`🔒 Content Protection: ${filteredCount} movies filtered for age-appropriate viewing (Age: ${userAge})`);
      
      // Show user-friendly notification (only once per session to avoid spam)
      if (!this.hasShownFilterNotification) {
        this.toastService.showInfo(
          `${filteredCount} movies hidden for age-appropriate viewing.`,
          'Content Protection Active'
        );
        this.hasShownFilterNotification = true;
      }
    }
    
    return filteredMovies;
  }

  // Get family-friendly movie recommendations based on age
  getFamilyFriendlyMovies(userAge: number, page: number = 1): Observable<MovieResponse> {
    let genreIds: number[] = [];
    
    if (userAge < 10) {
      // Very young: Animation, Family, Adventure
      genreIds = [16, 10751, 12];
    } else if (userAge < 13) {
      // Tweens: Animation, Family, Adventure, Comedy, Fantasy
      genreIds = [16, 10751, 12, 35, 14];
    } else if (userAge < 16) {
      // Teens: Adventure, Comedy, Fantasy, Science Fiction, Romance
      genreIds = [12, 35, 14, 878, 10749];
    } else {
      // 16-17: Most genres except Horror and Crime
      genreIds = [28, 12, 35, 18, 14, 36, 10402, 10749, 878, 10770];
    }
    
    const genreQuery = genreIds.join(',');
    const url = `${this.baseUrl}/discover/movie`;
    
    return this.http.get<MovieResponse>(url, {
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('with_genres', genreQuery)
        .set('page', page.toString())
        .set('vote_average.gte', '6.0') // Only well-rated movies
        .set('sort_by', 'popularity.desc')
    }).pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error getting family-friendly movies:', error);
        return of({ 
          results: [], 
          page: 1, 
          total_pages: 0, 
          total_results: 0 
        } as MovieResponse);
      })
    );
  }

  // Enhanced movie fetching methods with age filtering
  getTrendingMoviesFiltered(timeWindow: 'day' | 'week' = 'week', page: number = 1): Observable<Movie[]> {
    return this.getTrendingMovies(timeWindow, page).pipe(
      map(movies => this.filterMoviesByAge(movies))
    );
  }

  getPopularMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getPopularMovies(page).pipe(
      map(response => {
        if (response && response.results) {
          return {
            ...response,
            results: this.filterMoviesByAge(response.results)
          };
        }
        return response;
      })
    );
  }

  getTopRatedMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getTopRatedMovies(page).pipe(
      map(response => {
        if (response && response.results) {
          return {
            ...response,
            results: this.filterMoviesByAge(response.results)
          };
        }
        return response;
      })
    );
  }

  getNowPlayingMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getNowPlayingMovies(page).pipe(
      map(response => {
        if (response && response.results) {
          return {
            ...response,
            results: this.filterMoviesByAge(response.results)
          };
        }
        return response;
      })
    );
  }

  getUpcomingMoviesFiltered(page: number = 1): Observable<MovieResponse> {
    return this.getUpcomingMovies(page).pipe(
      map(response => {
        if (response && response.results) {
          return {
            ...response,
            results: this.filterMoviesByAge(response.results)
          };
        }
        return response;
      })
    );
  }

  searchMoviesFiltered(query: string, page: number = 1): Observable<MovieResponse> {
    return this.searchMovies(query, page).pipe(
      map(response => {
        if (response && response.results) {
          return {
            ...response,
            results: this.filterMoviesByAge(response.results)
          };
        }
        return response;
      })
    );
  }

  getMoviesByGenreFiltered(genreId: number, page: number = 1): Observable<MovieResponse> {
    return this.getMoviesByGenre(genreId, page).pipe(
      map(response => {
        if (response && response.results) {
          return {
            ...response,
            results: this.filterMoviesByAge(response.results)
          };
        }
        return response;
      })
    );
  }

  // Get movie certifications/ratings
  getMovieCertifications(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/release_dates`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      catchError(error => {
        console.error('Error getting movie certifications:', error);
        return of(null);
      })
    );
  }

  // Enhanced filtering with certification data
  private async isMovieAppropriateForAge(movie: Movie, userAge: number): Promise<boolean> {
    // Basic filtering first
    if (movie.adult) return false;
    
    // For users 16+, we can be less restrictive but still check certifications
    if (userAge >= 16) {
      try {
        const certifications = await this.getMovieCertifications(movie.id).toPromise();
        if (certifications && certifications.results) {
          const usCert = certifications.results.find((r: any) => r.iso_3166_1 === 'US');
          if (usCert && usCert.release_dates) {
            const rating = usCert.release_dates[0]?.certification;
            if (rating && ['NC-17', 'X'].includes(rating)) {
              return false;
            }
          }
        }
      } catch (error) {
        console.log('Could not get certification data, using basic filtering');
      }
    }
    
    return true;
  }

  // Helper method to get API parameters
  private getApiParams(): HttpParams {
    return new HttpParams();
  }

  // Helper method to get headers with authorization
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Helper method to get image URL
  getImageUrl(path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) {
      // Use a local SVG fallback instead of external placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgdmlld0JveD0iMCAwIDUwMCA3NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMzc1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
    }
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  // Helper method to get backdrop URL
  getBackdropUrl(path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) {
      // Use a local SVG fallback instead of external placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjY0MCIgeT0iMzYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
    }
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  // Helper method to get poster URL
  getPosterUrl(path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w185'): string {
    return this.getImageUrl(path, size);
  }
}
