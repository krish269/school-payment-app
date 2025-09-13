import axios from 'axios';

// This is the base URL of your running backend server
const API_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
});

// This is an interceptor. It will automatically add the authorization token
// to every request if it exists in local storage.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
