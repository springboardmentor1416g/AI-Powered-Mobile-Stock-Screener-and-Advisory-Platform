import axios from 'axios';

const api = axios.create({
  baseURL: 'http://<DEVICE_IP_ADDRESS>:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
