import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import AuthPage from "./components/AuthPage";
import Navbar from "./components/Navbar";
import RecentReleased from "./components/RecentReleased";
import MovieDetail from "./components/MovieDetail";
import GenrebasedMovies from "./components/GenrebasedMovies";
import RecommendedMovies from "./components/RecommendedMovies"; 
import SearchResults from "./components/SearchResults";

// Create and export UserContext
export const UserContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check for stored userId in localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
    }
  }, []);

  // Handle login or registration success
  const handleAuthentication = (id) => {
    setIsAuthenticated(true);
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem("userId");
  };

  return (
    <UserContext.Provider value={{ userId, isAuthenticated }}>
      <Router>
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <Routes>
          {/* Authentication Page */}
          <Route
            path="/auth"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <AuthPage onAuthSuccess={handleAuthentication} />
              )
            }
          />
          {/* Home Page */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Home /> : <Navigate to="/auth" />
            }
          />
          {/* Recent Releases */}
          <Route
            path="/recentreleased"
            element={
              isAuthenticated ? <RecentReleased /> : <Navigate to="/auth" />
            }
          />
          {/* Movie Details */}
          <Route
            path="/movie/:tconst"
            element={
              isAuthenticated ? <MovieDetail /> : <Navigate to="/auth" />
            }
          />
          {/* Genre-Based Movies */}
          <Route
            path="/movies/genre/:genreName"
            element={
              isAuthenticated ? <GenrebasedMovies /> : <Navigate to="/auth" />
            }
          />
          {/* Recommended Movies */}
          <Route
            path="/recommended"
            element={
              isAuthenticated ? <RecommendedMovies /> : <Navigate to="/auth" />
            } 
          />
          <Route
            path="/search/:type/:searchTerm"
            element={
              isAuthenticated ? <SearchResults /> : <Navigate to="/auth" />
              }
          />
          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
