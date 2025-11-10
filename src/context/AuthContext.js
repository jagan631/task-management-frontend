import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw error;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.login(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};