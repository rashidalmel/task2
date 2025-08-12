# TMDB API Setup Guide

## Getting Your TMDB API Key

1. **Visit TMDB Website**
   - Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
   - Click "Sign Up" to create a new account

2. **Create Account**
   - Fill in your email, username, and password
   - Verify your email address

3. **Get API Key**
   - After logging in, go to your account settings
   - Navigate to "API" section
   - Click "Click to generate" for the API Read Access Token (v4 auth)
   - Copy the generated API key

4. **Configure the Application**
   - Open `src/environments/environment.ts`
   - Replace `'YOUR_TMDB_API_KEY_HERE'` with your actual API key
   - Save the file

## API Features Available

The TMDB service includes the following features:

### Movie Data
- **Trending Movies**: Get daily/weekly trending movies
- **Popular Movies**: Get popular movies with pagination
- **Top Rated Movies**: Get highest rated movies
- **Now Playing**: Get currently playing movies
- **Upcoming Movies**: Get upcoming releases

### Search & Discovery
- **Movie Search**: Search movies by title, overview, etc.
- **Genre Filtering**: Get movies by specific genres
- **Movie Details**: Get detailed information about a specific movie

### Additional Data
- **Movie Credits**: Get cast and crew information
- **Movie Videos**: Get trailers and other videos
- **Movie Images**: Get posters, backdrops, and other images
- **Movie Recommendations**: Get similar movies
- **Genres**: Get all available movie genres

### Image URLs
- **Poster Images**: Different sizes (w92, w154, w185, w342, w500, w780, original)
- **Backdrop Images**: Different sizes (w300, w780, w1280, original)
- **Automatic Fallback**: Placeholder images when no image is available

## Usage Examples

```typescript
// In your component
constructor(private tmdbService: TmdbService) {}

// Get trending movies
this.tmdbService.getTrendingMovies().subscribe(movies => {
  console.log('Trending movies:', movies);
});

// Search movies
this.tmdbService.searchMovies('Avengers').subscribe(response => {
  console.log('Search results:', response.results);
});

// Get movie details
this.tmdbService.getMovieDetails(123).subscribe(movie => {
  console.log('Movie details:', movie);
});

// Get image URL
const posterUrl = this.tmdbService.getPosterUrl('/path/to/poster.jpg', 'w500');
```

## Rate Limits

TMDB API has rate limits:
- **Read Access**: 1,000 requests per day
- **Write Access**: 1,000 requests per day

For production applications, consider implementing caching to optimize API usage.

## Security Notes

- Never commit your API key to version control
- Use environment variables for production
- Consider implementing API key rotation for security
