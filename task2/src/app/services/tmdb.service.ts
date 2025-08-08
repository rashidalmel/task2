import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
      .pipe(map(response => response.results));
  }

  // Get popular movies
  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/popular`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams().set('page', page.toString())
    });
  }

  // Get top rated movies
  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/top_rated`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams().set('page', page.toString())
    });
  }

  // Get now playing movies
  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/now_playing`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams().set('page', page.toString())
    });
  }

  // Get upcoming movies
  getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/upcoming`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams().set('page', page.toString())
    });
  }

  // Search movies
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/search/movie`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('query', query)
        .set('page', page.toString())
    });
  }

  // Get movie details
  getMovieDetails(movieId: number): Observable<MovieDetails> {
    const url = `${this.baseUrl}/movie/${movieId}`;
    return this.http.get<MovieDetails>(url, { headers: this.getHeaders() });
  }

  // Get movies by genre
  getMoviesByGenre(genreId: number, page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/discover/movie`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams()
        .set('with_genres', genreId.toString())
        .set('page', page.toString())
    });
  }

  // Get genres
  getGenres(): Observable<{ genres: Genre[] }> {
    const url = `${this.baseUrl}/genre/movie/list`;
    return this.http.get<{ genres: Genre[] }>(url, { headers: this.getHeaders() });
  }

  // Get movie recommendations
  getMovieRecommendations(movieId: number, page: number = 1): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/${movieId}/recommendations`;
    return this.http.get<MovieResponse>(url, { 
      headers: this.getHeaders(),
      params: new HttpParams().set('page', page.toString())
    });
  }

  // Get movie credits (cast and crew)
  getMovieCredits(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/credits`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Get movie videos (trailers, etc.)
  getMovieVideos(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/videos`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Get movie images
  getMovieImages(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/images`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
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
      return 'https://via.placeholder.com/500x750?text=No+Image';
    }
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  // Helper method to get backdrop URL
  getBackdropUrl(path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) {
      return 'https://via.placeholder.com/1280x720?text=No+Image';
    }
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  // Helper method to get poster URL
  getPosterUrl(path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    return this.getImageUrl(path, size);
  }
}
