// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost, for physical device use your computer's IP
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiUrl();
