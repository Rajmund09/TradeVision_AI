import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't automatically follow redirects - we'll handle them manually
  maxRedirects: 0,
});

// Request interceptor to add token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[Axios] Added Authorization header for request: ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[Axios] No token found in localStorage for request: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle redirects manually (to preserve headers)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Handle 307 redirect - retry with same method and headers
    if (error.response?.status === 307 && !originalRequest._retry) {
      originalRequest._retry = true;
      const redirectUrl = error.response.headers.location;
      
      if (redirectUrl) {
        console.log(`[Axios] Handling 307 redirect to: ${redirectUrl}`);
        // Make sure Authorization header is set for the retry
        const token = localStorage.getItem('token');
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        // Update URL to the redirect location
        originalRequest.url = redirectUrl;
        return instance(originalRequest);
      }
    }
    
    // Handle 401 - DON'T redirect to login, just reject the error
    // The component should handle the error and show appropriate UI
    if (error.response?.status === 401) {
      console.warn('[Axios] 401 Unauthorized - Token may be invalid or expired');
      // Don't remove token automatically - let the user decide
      // Don't redirect - let the component handle it
    }
    
    return Promise.reject(error);
  }
);

export default instance;
