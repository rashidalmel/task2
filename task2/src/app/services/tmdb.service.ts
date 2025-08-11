import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  // Get trending movies
  getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Observable<Movie[]> {
    const url = `${this.baseUrl}/trending/movie/${timeWindow}`;
    return this.http.get<MovieResponse>(url, { headers: this.getHeaders() })
      .pipe(
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
      params: new HttpParams().set('page', page.toString())
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
      params: new HttpParams().set('page', page.toString())
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
      params: new HttpParams().set('page', page.toString())
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
      params: new HttpParams().set('page', page.toString())
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
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('query', query)
        .set('page', page.toString())
    }).pipe(
      timeout(5000), // Reduced timeout to 5 seconds for better UX
      catchError(error => {
        console.error('Timeout or error searching movies:', error);
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
      params: new HttpParams().set('page', page.toString())
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
