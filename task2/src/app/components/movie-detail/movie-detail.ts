import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TmdbService, MovieDetails } from '../../services/tmdb.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss'
})
export class MovieDetailComponent implements OnInit {
  movie: MovieDetails | null = null;
  credits: any = null;
  videos: any = null;
  isLoading: boolean = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tmdbService: TmdbService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const movieId = +params['id'];
      if (movieId) {
        this.loadMovieDetails(movieId);
      }
    });
  }

  loadMovieDetails(movieId: number) {
    this.isLoading = true;
    this.error = null;

    // Load movie details
    this.tmdbService.getMovieDetails(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.error = 'Failed to load movie details';
        this.isLoading = false;
      }
    });

    // Load movie credits (cast and crew)
    this.tmdbService.getMovieCredits(movieId).subscribe({
      next: (credits) => {
        this.credits = credits;
      },
      error: (error) => {
        console.error('Error loading movie credits:', error);
      }
    });

    // Load movie videos (trailers, etc.)
    this.tmdbService.getMovieVideos(movieId).subscribe({
      next: (videos) => {
        this.videos = videos;
      },
      error: (error) => {
        console.error('Error loading movie videos:', error);
      }
    });
  }

  getPosterUrl(path: string): string {
    return this.tmdbService.getPosterUrl(path, 'w500');
  }

  getBackdropUrl(path: string): string {
    return this.tmdbService.getBackdropUrl(path, 'w1280');
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
