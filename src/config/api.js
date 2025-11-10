// API Base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, uses Netlify Functions
  : 'http://localhost:8888/api';  // In development, uses Netlify Dev

export default API_BASE_URL;