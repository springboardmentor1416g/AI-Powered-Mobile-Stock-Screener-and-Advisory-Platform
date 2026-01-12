import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8081/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// basic placeholder interceptors (trace id, future auth, logging)
api.interceptors.request.use((config) => {
  config.headers["x-client"] = "mobile";
  return config;
});
