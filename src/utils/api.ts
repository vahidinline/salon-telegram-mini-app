import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  //baseURL:
  //'https://lively-meadow-8f10bc69131e43399fb94ec2bdf12e81.azurewebsites.net',
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
