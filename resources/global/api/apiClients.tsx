import axios from 'axios';

// Cast import.meta to any to bypass TypeScript error
const env = (import.meta as any).env;

const appType = (env.VITE_APP_TYPE || 'cxsun').toUpperCase();

const apiMethod = env[`VITE_${appType}_API_METHOD`] || 'TS';
const baseURL = env[`VITE_${appType}_API_URL`];
const frappeToken = env[`VITE_${appType}_TOKEN`];

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    if (apiMethod === 'FRAPPE') {
      if (frappeToken) {
        config.headers['Authorization'] = frappeToken;
        config.headers['Content-Type'] = 'application/json';
      } else {
        alert("Token Missing")
      }
    } else {
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
