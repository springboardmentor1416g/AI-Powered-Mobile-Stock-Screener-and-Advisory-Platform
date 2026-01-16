
const BACKEND_URLS = {
  ANDROID_EMULATOR: 'http://<LOCAL_IP_ADDRESS>:8080',
  LOCALHOST: 'http://localhost:8080',
  CUSTOM_IP: 'http://<LOCAL_IP_ADDRESS>:8080', // Change this to your machine's IP
};

// Change this to switch between different backend URLs
const ACTIVE_BACKEND = BACKEND_URLS.ANDROID_EMULATOR;
// const ACTIVE_BACKEND = BACKEND_URLS.LOCALHOST;
// const ACTIVE_BACKEND = BACKEND_URLS.CUSTOM_IP;

console.log(`🔧 Backend Configuration: ${ACTIVE_BACKEND}`);

export default ACTIVE_BACKEND;
