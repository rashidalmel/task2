import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Movie } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss'
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  
  // Sample movie data - in a real app, this would come from a service
  private movies: Movie[] = [
    {
      id: 1,
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      year: 1994,
      rating: 9.3,
      posterUrl: 'https://via.placeholder.com/400x600/007bff/ffffff?text=Shawshank',
      genre: 'Drama',
      cast: 'Tim Robbins, Morgan Freeman',
      director: 'Frank Darabont'
    },
    {
      id: 2,
      title: 'The Godfather',
      description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      year: 1972,
      rating: 9.2,
      posterUrl: 'https://via.placeholder.com/400x600/28a745/ffffff?text=Godfather',
      genre: 'Crime, Drama',
      cast: 'Marlon Brando, Al Pacino',
      director: 'Francis Ford Coppola'
    },
    {
      id: 3,
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      year: 1994,
      rating: 8.9,
      posterUrl: 'https://via.placeholder.com/400x600/dc3545/ffffff?text=Pulp+Fiction',
      genre: 'Crime, Drama',
      cast: 'John Travolta, Samuel L. Jackson',
      director: 'Quentin Tarantino'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const movieId = +params['id'];
      this.movie = this.movies.find(m => m.id === movieId) || null;
    });
  }
}
