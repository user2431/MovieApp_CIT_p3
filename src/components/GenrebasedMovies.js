import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../CSS/GenrebasedMovies.css';
import { Link } from 'react-router-dom';

const TMDB_API_KEY = '9ad9b152ca62395552190ab6ae0fd342'; 

const MoviesList = () => {
  const { genreName } = useParams(); // Extract genreName from the URL
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // Track current page
  const [totalPages, setTotalPages] = useState(0); // Track total pages

  useEffect(() => {
    const fetchMovies = async () => {
      if (!genreName) return;

      try {
        setLoading(true);
        setError(null); // Reset error state before each fetch

        // Make the API request with the genre name and pagination parameters
        const response = await fetch(`https://localhost:7019/api/movie/genre/${genreName}?page=${page}&pageSize=12`);

        if (!response.ok) {
          throw new Error(`Error fetching movies: ${response.statusText}`);
        }

        const data = await response.json();

        // Fetch posters for each movie using TMDB API
        const moviesWithPosters = await Promise.all(
          data.items.map(async (movie) => {
            try {
              const tmdbResponse = await fetch(
                `https://api.themoviedb.org/3/find/${movie.tconst.trim()}?external_source=imdb_id&api_key=${TMDB_API_KEY}`
              );
              const tmdbData = await tmdbResponse.json();
console.log(tmdbData);
              // Get the poster path if available
              const posterPath = tmdbData.tv_results?.[0]?.poster_path || null;

              return {
                ...movie,
                posterPath,
              };
            } catch (err) {
              console.error(`Failed to fetch poster for ${movie.tconst}:`, err);
              return { ...movie, posterPath: null }; // Fallback to no poster
            }
          })
        );

        // Update movies state
        setMovies(moviesWithPosters);
        setTotalPages(data.numberPages || 1); // Ensure totalPages defaults to 1 if undefined
      } catch (error) {
        setError(error.message); // Set error state
      } finally {
        setLoading(false); // Always stop loading after the fetch
      }
    };

    fetchMovies();
  }, [genreName, page]); // Refetch whenever genreName or page changes

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  if (loading) return <div className="loading">Loading movies...</div>;

  if (error) return <div className="error">Error: {error}</div>;

  if (movies.length === 0) return <div className="no-movies">No movies found for this genre.</div>;

  return (
    <div className="movies-list-container">
      <h3>Movies List for {genreName}</h3>
      <ul className="movies-grid">
        {movies.map((movie) => (
          <li key={movie.tconst} className="movie-item">
            <Link to={`/movie/${movie.tconst}`} className="movie-link">
            <img
              src={movie.posterPath ? `https://image.tmdb.org/t/p/w200${movie.posterPath}` : '/placeholder.jpg'}
              alt={movie.primarytitle}
              className="movie-poster"
            />
            <div className="movie-info">
              <strong>{movie.primarytitle}</strong> ({movie.startyear})
              <span>{movie.genres}</span>
            </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="pagination-container">
        <button onClick={handlePrevPage} disabled={page <= 0}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={page >= totalPages - 1}>
          Next
        </button>
      </div>

      <div className="page-number">
        <strong> Page:</strong> {page + 1} / {totalPages}
      </div>
    </div>
  );
};

export default MoviesList;
