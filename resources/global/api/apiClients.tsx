import axios from 'axios';

// const apiMethod = import.meta.env.VITE_API_METHOD || 'FAST_API';
const appType = (import.meta.env.VITE_APP_TYPE || 'cxsun').toUpperCase();

// ✅ Dynamically access base URL and token from env
const env = import.meta.env;
const apiMethod = env[`VITE_${appType}_API_METHOD`] || 'FAST_API';
const baseURL = env[`VITE_${appType}_API_URL`] || env.VITE_API_URL;
const frappeToken = env[`VITE_${appType}_TOKEN`];

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (apiMethod === 'FRAPPE') {
      // ✅ Use dynamic Frappe token based on APP_TYPE
      if (frappeToken) {
        config.headers['Authorization'] = frappeToken;
        config.headers['Content-Type'] = 'application/json';
      }else{
          alert("Token Missing")
      }
    } else {
      // ✅ FAST_API: Token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
