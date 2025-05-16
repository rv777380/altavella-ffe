import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { isAuthenticated } from './services/auth';
import './styles/admin-dashboard.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    setIsLoggedIn(isAuthenticated());
  }, []);
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  return isLoggedIn ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
};

export default App;
