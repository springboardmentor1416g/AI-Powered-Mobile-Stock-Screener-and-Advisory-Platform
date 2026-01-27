/**
 * Utility Helper Functions
 * Common utilities used across the application
 */

/**
 * Format currency
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code (INR, USD, etc.)
 * @returns {String} - Formatted currency string
 */
function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined) return 'N/A';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format large numbers with suffixes (K, M, B, T)
 * @param {Number} num - Number to format
 * @returns {String} - Formatted number with suffix
 */
function formatLargeNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (absNum >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (absNum >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (absNum >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  
  return num.toFixed(2);
}

/**
 * Calculate percentage change
 * @param {Number} oldVal - Original value
 * @param {Number} newVal - New value
 * @returns {Number|null} - Percentage change
 */
function percentageChange(oldVal, newVal) {
  if (!oldVal || oldVal === 0) return null;
  return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
}

/**
 * Format percentage
 * @param {Number} value - Percentage value
 * @param {Number} decimals - Number of decimal places
 * @returns {String} - Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals) + '%';
}

/**
 * Sleep/delay function
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse
 * @param {String} str - String to parse
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} - Parsed object or default value
 */
function safeJSONParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {Number} size - Size of each chunk
 * @returns {Array} - Array of chunks
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string (remove special characters)
 * @param {String} str - String to sanitize
 * @returns {String} - Sanitized string
 */
function sanitizeString(str) {
  if (!str) return '';
  return str.replace(/[^\w\s-]/gi, '').trim();
}

/**
 * Generate random string
 * @param {Number} length - Length of string
 * @returns {String} - Random string
 */
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove null/undefined values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object
 */
function removeNullValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  );
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date string
 */
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date string
 */
function formatDateReadable(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days between dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {Number} - Number of days
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Number} maxRetries - Maximum number of retries
 * @param {Number} delay - Initial delay in ms
 * @returns {Promise} - Result of function
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
}

/**
 * Truncate string with ellipsis
 * @param {String} str - String to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String} - Truncated string
 */
function truncate(str, maxLength = 50) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Check if value is numeric
 * @param {*} value - Value to check
 * @returns {Boolean} - True if numeric
 */
function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Calculate compound annual growth rate (CAGR)
 * @param {Number} startValue - Starting value
 * @param {Number} endValue - Ending value
 * @param {Number} years - Number of years
 * @returns {Number} - CAGR percentage
 */
function calculateCAGR(startValue, endValue, years) {
  if (!startValue || !endValue || !years || startValue <= 0) return null;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/**
 * Round to specified decimal places
 * @param {Number} num - Number to round
 * @param {Number} decimals - Decimal places
 * @returns {Number} - Rounded number
 */
function roundTo(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

module.exports = {
  formatCurrency,
  formatLargeNumber,
  percentageChange,
  formatPercentage,
  sleep,
  safeJSONParse,
  chunkArray,
  isValidEmail,
  sanitizeString,
  generateRandomString,
  deepClone,
  removeNullValues,
  formatDate,
  formatDateReadable,
  daysBetween,
  retryWithBackoff,
  truncate,
  isNumeric,
  calculateCAGR,
  roundTo,
};
