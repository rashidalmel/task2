import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TmdbService, MovieDetails } from '../../services/tmdb.service';
import { forkJoin, catchError, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss'
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie: MovieDetails | null = null;
  credits: any = null;
  videos: any = null;
  isLoading: boolean = true;
  isLoadingDetails: boolean = true;
  isLoadingCredits: boolean = true;
  isLoadingVideos: boolean = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private loadingTimeout: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tmdbService: TmdbService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const movieId = +params['id'];
      console.log('Movie Detail - Route params:', params); // Debug log
      console.log('Movie Detail - Movie ID:', movieId); // Debug log
      if (movieId) {
        this.loadMovieDetails(movieId);
      } else {
        console.error('Movie Detail - No movie ID found in route params');
        this.error = 'Invalid movie ID';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  loadMovieDetails(movieId: number) {
    console.log('Movie Detail - Loading details for movie ID:', movieId); // Debug log
    this.isLoading = true;
    this.isLoadingDetails = true;
    this.isLoadingCredits = true;
    this.isLoadingVideos = true;
    this.error = null;

    // Set a loading timeout to prevent infinite loading
    this.loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.log('Movie Detail - Loading timeout reached'); // Debug log
        this.error = 'Loading is taking longer than expected. Please check your connection and try again.';
        this.isLoading = false;
        this.isLoadingDetails = false;
        this.isLoadingCredits = false;
        this.isLoadingVideos = false;
      }
    }, 15000); // 15 second timeout

    // Load all data in parallel using forkJoin for better performance
    forkJoin({
      details: this.tmdbService.getMovieDetails(movieId).pipe(
        catchError(error => {
          console.error('Error loading movie details:', error);
          this.error = 'Failed to load movie details';
          return of(null);
        })
      ),
      credits: this.tmdbService.getMovieCredits(movieId).pipe(
        catchError(error => {
          console.error('Error loading movie credits:', error);
          return of(null);
        })
      ),
      videos: this.tmdbService.getMovieVideos(movieId).pipe(
        catchError(error => {
          console.error('Error loading movie videos:', error);
          return of(null);
        })
      )
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        console.log('Movie Detail - API results received:', results); // Debug log
        // Clear the timeout since we got a response
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
        }
        
        this.movie = results.details;
        this.credits = results.credits;
        this.videos = results.videos;
        
        // Update loading states
        this.isLoadingDetails = false;
        this.isLoadingCredits = false;
        this.isLoadingVideos = false;
        
        // Overall loading is complete when details are loaded
        this.isLoading = false;
        console.log('Movie Detail - Loading completed successfully'); // Debug log
      },
      error: (error) => {
        console.error('Movie Detail - Error in forkJoin:', error); // Debug log
        // Clear the timeout since we got an error
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
        }
        
        console.error('Error loading movie data:', error);
        this.error = 'Failed to load movie data';
        this.isLoading = false;
        this.isLoadingDetails = false;
        this.isLoadingCredits = false;
        this.isLoadingVideos = false;
      }
    });
  }

  getPosterUrl(path: string): string {
    return this.tmdbService.getPosterUrl(path, 'w500');
  }

  getBackdropUrl(path: string): string {
    return this.tmdbService.getBackdropUrl(path, 'w1280');
  }

  getCastProfileUrl(profilePath: string | null): string {
    if (profilePath) {
      return this.tmdbService.getPosterUrl(profilePath, 'w185');
    }
    // Use a local fallback image or a data URL instead of external placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTg1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE4NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODUiIGhlaWdodD0iMjc4IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik05Mi41IDEzOWMxNi41NiAwIDMwLTEzLjQ0IDMwLTMwUzEwOS4wNiA3OSA5Mi41IDc5UzYyLjUgOTIuNDQgNjIuNSAxMDlTMTI1LjU2IDEzOSA5Mi41IDEzOVoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHBhdGggZD0iTTkyLjUgMTU5Yy0yNy42IDAtNTAuNSAyMi45LTUwLjUgNTAuNXYxOC41aDEwMHYtMTguNUMxNDMgMTgxLjkgMTIwLjEgMTU5IDkyLjUgMTU5WiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K';
  }

  getCustomBackgroundUrl(): string {
    // Return the custom movie theater image from public folder
    return '/movie-theater-2502213_1920.jpg';
  }

  getTrailerUrl(): SafeResourceUrl | null {
    if (this.videos?.results) {
      const trailer = this.videos.results.find((video: any) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      return trailer ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${trailer.key}`) : null;
    }
    return null;
  }

  getTopCast(): any[] {
    if (this.credits?.cast) {
      return this.credits.cast.slice(0, 6); // Show top 6 cast members
    }
    return [];
  }

  getDirector(): string {
    if (this.credits?.crew) {
      const director = this.credits.crew.find((member: any) => member.job === 'Director');
      return director ? director.name : 'Information not available';
    }
    return 'Information not available';
  }

  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  formatCurrency(amount: number): string {
    if (amount === 0) return 'Not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getReleaseYear(dateString: string): number {
    return new Date(dateString).getFullYear();
  }

  formatReleaseDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
