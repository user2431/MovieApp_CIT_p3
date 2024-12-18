import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App"; // Import UserContext
import "../CSS/Navbar.css"; // Import relevant CSS
import UserProfile from "./UserProfile"; // Import UserProfile component

const Navbar = ({ onLogout }) => {
  const [genres, setGenres] = useState([]); // State to hold genres
  const [loading, setLoading] = useState(true); // Loading state for genres
  const [selectedGenre, setSelectedGenre] = useState(""); // Selected genre
  const [showUserProfile, setShowUserProfile] = useState(false); // Profile popup state

  // Search functionality state
  const [searchTerm, setSearchTerm] = useState(""); // User input for search term
  const [searchCategory, setSearchCategory] = useState("general"); // Default search category

  const navigate = useNavigate();
  const { userId } = useContext(UserContext); // Access userId from UserContext

  // Fetch genres from the backend API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://localhost:7019/api/movie/genre");
        if (!response.ok) throw new Error("Failed to fetch genres");

        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Handle Genre Selection and Navigation
  const handleGenreSelect = (genreName) => {
    setSelectedGenre(genreName);
    navigate(`/movies/genre/${genreName}`);
  };

  // Handle Search Form Submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${searchCategory}/${searchTerm.trim()}`);
      setSearchTerm("");
    }
  };

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <h1 className="app-name" onClick={() => navigate("/")}>
          MovieApp
        </h1>

        {/* Genre Dropdown */}
        <div>
          {loading ? (
            <p>Loading Genres...</p>
          ) : (
            <select
              className="dropdown-menu"
              value={selectedGenre}
              onChange={(e) => handleGenreSelect(e.target.value)}
            >
              <option value="">Select Genre</option>
              {genres.map((genre) => (
                <option key={genre.genreid} value={genre.genreName}>
                  {genre.genreName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation Buttons */}
        <button onClick={() => navigate("/recentreleased")} className="navbar-link">
          Recent Releases
        </button>
        <button onClick={() => navigate("/recommended")} className="navbar-link">
          Recommended
        </button>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="search-category"
          >
            <option value="general">All</option>
            <option value="actorname">Actors</option>
            <option value="movie">Movies</option>
            <option value="releaseyear">Release Year</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {/* Profile Button */}
        <button
          onClick={() => setShowUserProfile(true)}
          className="navbar-link profile-btn"
        >
          Profile
        </button>

        {/* Logout Button */}
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* UserProfile Popup */}
      {showUserProfile && <UserProfile onClose={() => setShowUserProfile(false)} />}
    </nav>
  );
};

export default Navbar;