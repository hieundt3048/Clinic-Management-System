import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Adjust the base URL to your backend endpoint
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = (userData) => {
  return apiClient.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

// You can add other API calls here

export default apiClient;
