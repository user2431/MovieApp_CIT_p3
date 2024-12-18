// src/components/RecommendedMovies.js
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { Link } from "react-router-dom";
import "../CSS/RecommendedMovies.css"; 

const RecommendedMovies = () => {
  const { userId } = useContext(UserContext);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        setLoading(true);

        // Step 1: Fetch notes to get Movie IDs
        const notesResponse = await fetch(
          `https://localhost:7019/api/Notes/notes/${userId}`
        );
        if (!notesResponse.ok) throw new Error("Failed to fetch user notes.");
        const notesData = await notesResponse.json();
        const movieIds = notesData.items.map((note) => note.tconst);

        // Step 2: Fetch similar movies for each Movie ID
        const similarMoviesSet = new Set();
        await Promise.all(
          movieIds.map(async (movieId) => {
            const similarResponse = await fetch(
              `https://localhost:7019/api/movie/similar/${movieId}`
            );
            if (similarResponse.ok) {
              const similarMovies = await similarResponse.json();
              similarMovies.forEach((movie) => similarMoviesSet.add(movie));
            }
          })
        );

        // Convert Set to Array and apply pagination
        const moviesArray = Array.from(similarMoviesSet);
        const paginatedMovies = moviesArray.slice(
          page * pageSize,
          (page + 1) * pageSize
        );

        setRecommendedMovies(paginatedMovies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRecommendedMovies();
  }, [userId, page, pageSize]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 0));

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="recommended-movies-container">
      <h2>Recommended Movies</h2>
      {recommendedMovies.length > 0 ? (
        <>
          <div className="movie-grid">
            {recommendedMovies.map((movie, index) => (
              <div key={index} className="movie-item">
                <Link to={`/movie/${movie.tconst}`} className="movie-link">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                    alt={movie.primarytitle}
                    className="movie-poster"
                  />
                  <div className="movie-details">
                    <strong>{movie.primarytitle}</strong> ({movie.startyear})
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={page === 0}>
              Previous
            </button>
            <button onClick={handleNextPage} disabled={recommendedMovies.length < pageSize}>
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No recommended movies found.</p>
      )}
    </div>
  );
};

export default RecommendedMovies;
