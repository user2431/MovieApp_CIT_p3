import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../App"; 
import "../CSS/UserProfile.css"; 

const UserProfile = ({ onClose }) => {
  const { userId } = useContext(UserContext); 
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [notes, setNotes] = useState([]);
  const [movieNames, setMovieNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data and notes
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Fetch user information (username and email)
        const userInfoResponse = await fetch(
          `https://localhost:7019/api/User/userinfo/${userId}`
        );
        if (!userInfoResponse.ok) throw new Error("Failed to fetch user info.");
        const userInfoData = await userInfoResponse.json();

        // Fetch user notes
        const notesResponse = await fetch(
          `https://localhost:7019/api/Notes/notes/${userId}`
        );
        if (!notesResponse.ok) throw new Error("Failed to fetch user notes.");
        const notesData = await notesResponse.json();

        // Set user info and notes
        setUserData(userInfoData);
        setNotes(notesData.items || notesData); 

        // Fetch movie names for each note
        const movieNameMap = {};
        await Promise.all(
          notesData.items.map(async (note) => {
            const movieResponse = await fetch(
              `https://localhost:7019/api/movie/${note.tconst}`
            );
            if (movieResponse.ok) {
              const movieData = await movieResponse.json();
              movieNameMap[note.tconst] = movieData.primarytitle || "Unknown Movie";
            } else {
              movieNameMap[note.tconst] = "Unknown Movie";
            }
          })
        );

        setMovieNames(movieNameMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserProfile();
  }, [userId]);

  // Handle note deletion
  const handleDeleteNote = async (movieId) => {
    try {
      const response = await fetch(
        `https://localhost:7019/api/Notes/delete/${userId}/${movieId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete note.");

      // Remove the deleted note from state
      setNotes((prevNotes) => prevNotes.filter((note) => note.tconst !== movieId));
      const updatedMovieNames = { ...movieNames };
      delete updatedMovieNames[movieId];
      setMovieNames(updatedMovieNames);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-profile-popup">
      <div className="user-profile-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>User Profile</h2>
        <p>
          <strong>Username:</strong> {userData.username}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <h3>Your Notes</h3>
        {notes.length > 0 ? (
          <ul className="notes-list">
            {notes.map((note, index) => (
              <li key={index}>
                <strong>Movie:</strong> {movieNames[note.tconst] || "Loading..."} <br />
                <strong>Note:</strong> {note.note} <br />
                <strong>Created:</strong>{" "}
                {new Date(note.createdDate).toLocaleString()}
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteNote(note.tconst)}
                >
                  Delete Note
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes found.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
