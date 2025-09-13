    import axios from 'axios';
    
    // This is the "smart" part. Vite (our build tool) makes environment variables
    // starting with "VITE_" available here.
    // When we run `npm run dev`, `import.meta.env.VITE_API_URL` will be undefined,
    // so it will fall back to 'http://localhost:3000'.
    // When Vercel builds our site, we will tell it what the VITE_API_URL is,
    // and it will use our live Render URL instead.
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const apiClient = axios.create({
      baseURL: API_URL,
    });
    
    apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    export default apiClient;
    

