import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Movie {
  id: number;
  title: string;
  description: string;
  year: number;
  rating: number;
  posterUrl?: string;
  genre?: string;
  cast?: string;
  director?: string;
}

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCardComponent {
  @Input() movie!: Movie;
}
