
import BACKEND_URL from '../../config/backend-config';
import axios from 'axios';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
