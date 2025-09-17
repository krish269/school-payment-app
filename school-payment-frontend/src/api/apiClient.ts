import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
});

// This interceptor attaches the token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- This is the new, critical addition ---
// This interceptor inspects every response coming back from the API.
apiClient.interceptors.response.use(
  // If the response is successful (e.g., status 200), just pass it along.
  (response) => response,
  // If there is an error in the response...
  (error) => {
    // Check if the error is a 401 Unauthorized error.
    if (error.response && error.response.status === 401) {
      // This means the user's token is invalid or expired.
      // 1. Remove the bad token from storage.
      localStorage.removeItem('authToken');
      
      // 2. Redirect the user to the login page.
      // We check to make sure we're not already on the login page to prevent a loop.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Pass the error along so that the original component can still handle it if needed.
    return Promise.reject(error);
  }
);

export default apiClient;

