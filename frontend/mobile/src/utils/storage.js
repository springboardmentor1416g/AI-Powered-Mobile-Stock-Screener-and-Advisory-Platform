let AsyncStorage;
try {
  // Try Expo/React Native AsyncStorage
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  try {
    // Fallback for React Native
    AsyncStorage = require('react-native').AsyncStorage;
  } catch (e2) {
    // Mock for development/testing
    console.warn('AsyncStorage not available, using in-memory storage');
    const memoryStorage = {};
    AsyncStorage = {
      getItem: async (key) => memoryStorage[key] || null,
      setItem: async (key, value) => { memoryStorage[key] = value; },
      removeItem: async (key) => { delete memoryStorage[key]; },
    };
  }
}

const SAVED_RESULTS_KEY = '@screener_saved_results';

/**
 * Save screener results temporarily
 */
export async function saveResults(results, query, timestamp) {
  try {
    const savedResults = {
      results,
      query,
      timestamp,
      savedAt: new Date().toISOString(),
    };
    
    // Get existing saved results
    const existing = await getSavedResults();
    
    // Add new result (limit to last 10)
    const updated = [savedResults, ...existing].slice(0, 10);
    
    await AsyncStorage.setItem(SAVED_RESULTS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving results:', error);
    return false;
  }
}

/**
 * Get all saved results
 */
export async function getSavedResults() {
  try {
    const data = await AsyncStorage.getItem(SAVED_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading saved results:', error);
    return [];
  }
}

/**
 * Clear all saved results
 */
export async function clearSavedResults() {
  try {
    await AsyncStorage.removeItem(SAVED_RESULTS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing saved results:', error);
    return false;
  }
}
