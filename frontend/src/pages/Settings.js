import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';
import '../styles/Settings.css';

function Settings() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [username, setUsername] = useState(storedUser.username || '');
  const [email, setEmail] = useState(storedUser.email || '');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [reminders, setReminders] = useState(localStorage.getItem('reminders') !== 'false');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await authAPI.updateProfile(username, email);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage('Profile saved.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not save profile.');
    }
  };

  const toggleReminders = (enabled) => {
    setReminders(enabled);
    localStorage.setItem('reminders', enabled);
  };

  return <div className="settings-page"><Navbar /><main className="settings-container"><h1>Profile & settings</h1><p className="settings-intro">Keep your account and workspace preferences current.</p>{message && <p className="settings-message">{message}</p>}<form className="settings-panel" onSubmit={saveProfile}><h2>Profile</h2><label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button type="submit">Save profile</button></form><section className="settings-panel"><h2>Workspace</h2><label className="setting-toggle"><input type="checkbox" checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} /> Dark mode</label><label className="setting-toggle"><input type="checkbox" checked={reminders} onChange={(event) => toggleReminders(event.target.checked)} /> Due-date reminders</label></section></main></div>;
}

export default Settings;
