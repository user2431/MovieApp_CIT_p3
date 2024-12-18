import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../CSS/Home.css'; // Import custom CSS for styling

const SearchResults = () => {
    const [movies, setMovies] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [page, setPage] = useState(0); 
    const [totalPages, setTotalPages] = useState(0); 
    const { type, searchTerm } = useParams();

    const TMDB_API_KEY = '9ad9b152ca62395552190ab6ae0fd342'; // TMDB API Key

    // Function to construct the endpoint based on search type
    const getSearchEndpoint = () => {
        switch (type) {
            case 'releaseyear':
                return `https://localhost:7019/api/movie/releaseyear/${searchTerm}?page=${page}&pagesize=10`;
            case 'actorname':
                return `https://localhost:7019/api/movie/actorname/${searchTerm}?page=${page}&pagesize=10`;
            case 'movie':
                return `https://localhost:7019/api/movie/search/${searchTerm}?page=${page}&pagesize=10`;
            default:
                return `https://localhost:7019/api/movie/search/${searchTerm}?page=${page}&pagesize=10`;
        }
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch results from your backend API
                const endpoint = getSearchEndpoint();
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }

                const data = await response.json();

                // Fetch poster data from TMDB for each movie
                const moviesWithPosters = await Promise.all(
                    data.items.map(async (movie) => {
                        try {
                            const tmdbResponse = await fetch(
                                `https://api.themoviedb.org/3/find/${movie.tconst.trim()}?external_source=imdb_id&api_key=${TMDB_API_KEY}`
                            );
                            const tmdbData = await tmdbResponse.json();

                            // Extract poster path if available
                            const posterPath = tmdbData.movie_results?.[0]?.poster_path || null;

                            return { ...movie, posterPath };
                        } catch {
                            return { ...movie, posterPath: null };
                        }
                    })
                );

                setMovies(moviesWithPosters);
                setTotalPages(data.numberPages || 1);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [type, searchTerm, page]);

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    if (loading) return <p>Loading search results...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="home-page-container">
            <h3>
                Search Results for "{searchTerm}" in "{type === 'general' ? 'All Categories' : type}"
            </h3>
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
                <strong>Page:</strong> {page + 1} / {totalPages}
            </div>
        </div>
    );
};
export default SearchResults;
