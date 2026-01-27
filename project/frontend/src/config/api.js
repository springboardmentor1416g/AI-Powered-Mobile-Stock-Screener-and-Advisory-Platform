import { Platform } from "react-native";

const LAN_IP = "172.21.10.138"; // your laptop IP (same network)
const PORT = 8080;

export const API_BASE =
  Platform.OS === "web"
    ? `http://localhost:${PORT}`
    : `http://${LAN_IP}:${PORT}`;

export const API_V1 = `${API_BASE}/api/v1`;
