import React, { useState, useEffect } from 'react';
import '../CSS/Home.css'; 
import { Link } from 'react-router-dom';

const RecentReleased = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0); 
    const [totalPages, setTotalPages] = useState(0); 

    const TMDB_API_KEY = '9ad9b152ca62395552190ab6ae0fd342'; 

    useEffect(() => {
        const fetchMoviesWithPosters = async () => {
            try {
                setLoading(true);
                const currentyear = new Date().getFullYear();
                const response = await fetch(`https://localhost:7019/api/movie/releaseyear/${currentyear}?page=${page}&pagesize=12`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }

                const data = await response.json();
                const moviesWithPosters = await Promise.all(
                    data.items.map(async (movie) => {
                      
                        const tmdbResponse = await fetch(
                            `https://api.themoviedb.org/3/find/${movie.tconst.trim()}?external_source=imdb_id&api_key=${TMDB_API_KEY}`
                        );
                        const tmdbData = await tmdbResponse.json();
                             
                        // Get the poster path if available
                        const posterPath =
                            tmdbData.tv_results?.[0]?.poster_path || null;
                        return {
                            ...movie,
                            posterPath,
                        };
                    })
                );

                setMovies(moviesWithPosters);
                setTotalPages(data.numberPages || 1); // Default to 1 if not provided
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchMoviesWithPosters();
    }, [page]);

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

    if (loading) return <p>Loading movies...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="home-page-container">
            <h3>Recent Released</h3>
            <div className="movie-grid">
                {movies.map((movie) => (
                    <div key={movie.tconst} className="movie-item">
                         <Link to={`/movie/${movie.tconst}`} className="movie-link">
                        {movie.posterPath ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                                alt={movie.primarytitle}
                                className="movie-poster"
                            />
                        ) : (
                            <div className="placeholder-poster">No Image</div>
                        )}
                        <div className="movie-details">
                            <strong>{movie.primarytitle}</strong> ({movie.startyear})
                            <p>{movie.genres}</p>
                        </div>
                        </Link>
                    </div>
                ))}
            </div>

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
export default RecentReleased;