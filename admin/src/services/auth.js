/**
 * Authentication service for Lourini FFE Admin
 */
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Constants
const AUTH_TOKEN_KEY = 'ffe_auth_token';
const AUTH_USER_KEY = 'ffe_auth_user';
const API_BASE_URL = 'https://lourini-ffe-api.altavella.workers.dev';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<boolean>} Login success
 */
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      // Store token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  
  if (!token) {
    return false;
  }
  
  try {
    // Check token expiration
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      // Token expired
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    // Token invalid
    logout();
    return false;
  }
};

/**
 * Get authentication token
 * @returns {string|null} Auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Get authenticated user
 * @returns {Object|null} User data
 */
export const getAuthUser = () => {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
};

/**
 * Get auth header for requests
 * @returns {Object} Auth header
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`
  };
};
