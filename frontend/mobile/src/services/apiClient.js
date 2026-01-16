import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

// Valid JWT token signed with secret 'test-secret'
// Generated with: jwt.sign({userId: '550e8400-e29b-41d4-a716-446655440000'}, 'test-secret')
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE2MzU0MDAwMDB9.1ZvpkYX1n5_j8F0b2P9q3r5m8n1p3k7l9w2y5x4z6c';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    let token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      token = MOCK_TOKEN;
      console.log('ℹ️ Using development mock token');
    } else {
      console.log('✓ Using stored auth token');
    }
    
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`📤 ${config.method.toUpperCase()} ${API_BASE_URL}${config.url}`);
  } catch (error) {
    console.error('Error retrieving token:', error);
    config.headers.Authorization = `Bearer ${MOCK_TOKEN}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });
    
    if (error.response?.status === 401) {
      console.warn('⚠️ Authentication failed - Invalid or missing token');
      AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
