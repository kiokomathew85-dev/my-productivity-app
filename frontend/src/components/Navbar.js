import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Productivity App</h2>
      </div>
      <div className="navbar-content">
        {user && (
          <>
            <button onClick={() => setDarkMode(!darkMode)} className="theme-btn" aria-label="Toggle dark mode">{darkMode ? 'Light' : 'Dark'}</button>
            <span className="user-info">Welcome, {user.username}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
