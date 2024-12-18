import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../App";
import "../CSS/MovieDetail.css";

const MovieDetail = () => {
  const { tconst } = useParams(); // Get movie ID from the route
  const { userId } = useContext(UserContext); // Access userId from UserContext
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0); // Store the user's rating
  const [existingRating, setExistingRating] = useState(null); // Track if the movie is already rated
  const [comments, setComments] = useState("");

  // Fetch movie details and existing rating
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);

        // Fetch movie details from backend
        const response = await fetch(`https://localhost:7019/api/movie/${tconst}`);
        if (!response.ok) throw new Error("Failed to fetch movie details");

        const movie = await response.json();
        setMovieDetails(movie);

        // Fetch existing rating
        const ratingResponse = await fetch(
          `https://localhost:7019/api/rating/${userId}/${tconst}`
        );
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setExistingRating(ratingData.rating || null); // Set existing rating if available
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [tconst, userId]);

  // Handle rating submission
  const handleRatingSubmit = async () => {
    if (existingRating !== null) {
      alert(`You have already rated this movie: ${existingRating}/10`);
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7019/api/rating/rate?userId=${userId}&movieId=${tconst}&rating=${rating}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to submit rating");
      setExistingRating(rating); // Update the existing rating state
      alert("Rating submitted successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle rating deletion
  const handleRatingDelete = async () => {
    try {
      const response = await fetch(
        `https://localhost:7019/api/rating/rate?userId=${userId}&movieId=${tconst}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to delete rating");
      setExistingRating(null); // Reset the existing rating state
      alert("Rating deleted successfully! You can now rate the movie again.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle comments submission
  const handleCommentsSubmit = async () => {
    try {
      const response = await fetch(
        `https://localhost:7019/api/Notes?Userid=${userId}&MovieId=${tconst}&Notes=${encodeURIComponent(
          comments
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to submit comment");
      alert("Comment submitted successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const { primarytitle, originaltitle, startyear, genres, runtimeminutes, titletype } = movieDetails;

  return (
    <div className="movie-detail-container">
      {/* Movie Information */}
      <div className="movie-info">
        <h2>{primarytitle} ({startyear})</h2>
        <p><strong>Original Title:</strong> {originaltitle}</p>
        <p><strong>Type:</strong> {titletype}</p>
        <p><strong>Genres:</strong> {genres || "N/A"}</p>
        <p><strong>Runtime:</strong> {runtimeminutes ? `${runtimeminutes} mins` : "N/A"}</p>
      </div>

      {/* Actions Section */}
      <div className="movie-actions">
        {/* Rating Section */}
        <div className="rating-section">
          <p>
            Rate this movie (1-10):{" "}
            {existingRating !== null ? (
              <span>Your Rating: {existingRating}/10</span>
            ) : null}
          </p>
          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="rating-input"
            disabled={existingRating !== null} // Disable input if already rated
          />
          <button
            onClick={handleRatingSubmit}
            className="submit-rating-btn"
            disabled={existingRating !== null} // Disable button if already rated
          >
            Submit Rating
          </button>
          {existingRating !== null && (
            <button onClick={handleRatingDelete} className="delete-rating-btn">
              Delete Rating
            </button>
          )}
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <textarea
            placeholder="Add your comments here..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="comments-textarea"
          />
          <button onClick={handleCommentsSubmit} className="submit-comments-btn">
            Save Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
