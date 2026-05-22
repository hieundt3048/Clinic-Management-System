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

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export default apiClient;
