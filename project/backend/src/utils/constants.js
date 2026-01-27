/**
 * Application Constants
 * Central location for all constant values
 */

// Market sectors
const SECTORS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Industrial',
  'Materials',
  'Utilities',
  'Real Estate',
  'Telecom',
  'Basic Materials',
];

// Stock exchanges
const EXCHANGES = [
  'NSE',
  'BSE',
  'NYSE',
  'NASDAQ',
  'LSE',
  'TSE',
  'HKEX',
];

// Fiscal quarters
const FISCAL_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

// Alert frequencies
const ALERT_FREQUENCIES = [
  'realtime',
  'daily',
  'weekly',
  'monthly',
];

// Alert types
const ALERT_TYPES = [
  'price',
  'fundamental',
  'technical',
  'earnings',
  'news',
];

// DSL operators
const DSL_OPERATORS = [
  '<',
  '>',
  '<=',
  '>=',
  '=',
  '!=',
  'between',
  'in',
  'not_in',
  'exists',
  'like',
];

// DSL logical operators
const DSL_LOGICAL_OPS = ['and', 'or', 'not'];

// Time periods for metrics
const TIME_PERIODS = [
  { value: 'last_n_quarters', label: 'Last N Quarters' },
  { value: 'last_n_years', label: 'Last N Years' },
  { value: 'trailing_12_months', label: 'Trailing 12 Months' },
  { value: 'ytd', label: 'Year to Date' },
];

// Aggregation methods
const AGGREGATION_METHODS = [
  'all',
  'any',
  'avg',
  'sum',
  'min',
  'max',
  'count',
];

// Screener field types
const FIELD_TYPES = {
  NUMERIC: 'numeric',
  STRING: 'string',
  BOOLEAN: 'boolean',
  DATE: 'date',
};

// Screener fields with metadata
const SCREENER_FIELDS = {
  // Valuation metrics
  pe_ratio: { type: FIELD_TYPES.NUMERIC, label: 'P/E Ratio', category: 'Valuation' },
  pb_ratio: { type: FIELD_TYPES.NUMERIC, label: 'P/B Ratio', category: 'Valuation' },
  ps_ratio: { type: FIELD_TYPES.NUMERIC, label: 'P/S Ratio', category: 'Valuation' },
  peg_ratio: { type: FIELD_TYPES.NUMERIC, label: 'PEG Ratio', category: 'Valuation' },
  
  // Profitability metrics
  roe: { type: FIELD_TYPES.NUMERIC, label: 'Return on Equity', category: 'Profitability' },
  roa: { type: FIELD_TYPES.NUMERIC, label: 'Return on Assets', category: 'Profitability' },
  operating_margin: { type: FIELD_TYPES.NUMERIC, label: 'Operating Margin', category: 'Profitability' },
  profit_margin: { type: FIELD_TYPES.NUMERIC, label: 'Profit Margin', category: 'Profitability' },
  
  // Growth metrics
  revenue_growth_yoy: { type: FIELD_TYPES.NUMERIC, label: 'Revenue Growth YoY', category: 'Growth' },
  earnings_growth_yoy: { type: FIELD_TYPES.NUMERIC, label: 'Earnings Growth YoY', category: 'Growth' },
  eps_growth: { type: FIELD_TYPES.NUMERIC, label: 'EPS Growth', category: 'Growth' },
  
  // Financial metrics
  revenue: { type: FIELD_TYPES.NUMERIC, label: 'Revenue', category: 'Financials' },
  net_income: { type: FIELD_TYPES.NUMERIC, label: 'Net Income', category: 'Financials' },
  ebitda: { type: FIELD_TYPES.NUMERIC, label: 'EBITDA', category: 'Financials' },
  eps: { type: FIELD_TYPES.NUMERIC, label: 'Earnings Per Share', category: 'Financials' },
  
  // Balance sheet
  total_debt: { type: FIELD_TYPES.NUMERIC, label: 'Total Debt', category: 'Balance Sheet' },
  debt_to_equity: { type: FIELD_TYPES.NUMERIC, label: 'Debt to Equity', category: 'Balance Sheet' },
  debt_to_fcf: { type: FIELD_TYPES.NUMERIC, label: 'Debt to FCF', category: 'Balance Sheet' },
  free_cash_flow: { type: FIELD_TYPES.NUMERIC, label: 'Free Cash Flow', category: 'Balance Sheet' },
  
  // Market data
  market_cap: { type: FIELD_TYPES.NUMERIC, label: 'Market Cap', category: 'Market' },
  current_price: { type: FIELD_TYPES.NUMERIC, label: 'Current Price', category: 'Market' },
  volume: { type: FIELD_TYPES.NUMERIC, label: 'Volume', category: 'Market' },
  
  // Company info
  sector: { type: FIELD_TYPES.STRING, label: 'Sector', category: 'Company' },
  industry: { type: FIELD_TYPES.STRING, label: 'Industry', category: 'Company' },
  exchange: { type: FIELD_TYPES.STRING, label: 'Exchange', category: 'Company' },
  country: { type: FIELD_TYPES.STRING, label: 'Country', category: 'Company' },
  
  // Analyst data
  price_target_avg: { type: FIELD_TYPES.NUMERIC, label: 'Price Target Avg', category: 'Analyst' },
  price_target_low: { type: FIELD_TYPES.NUMERIC, label: 'Price Target Low', category: 'Analyst' },
  price_target_high: { type: FIELD_TYPES.NUMERIC, label: 'Price Target High', category: 'Analyst' },
};

// User roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  PREMIUM: 'premium',
};

// API rate limits
const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per window
  },
  SCREENER: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 screener queries per minute
  },
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

// Market cap ranges
const MARKET_CAP_RANGES = {
  MEGA_CAP: { min: 200e9, label: 'Mega Cap (>$200B)' },
  LARGE_CAP: { min: 10e9, max: 200e9, label: 'Large Cap ($10B-$200B)' },
  MID_CAP: { min: 2e9, max: 10e9, label: 'Mid Cap ($2B-$10B)' },
  SMALL_CAP: { min: 300e6, max: 2e9, label: 'Small Cap ($300M-$2B)' },
  MICRO_CAP: { max: 300e6, label: 'Micro Cap (<$300M)' },
};

// Technical indicators
const TECHNICAL_INDICATORS = [
  'SMA',
  'EMA',
  'RSI',
  'MACD',
  'Bollinger Bands',
  'ATR',
  'ADX',
  'Stochastic',
];

// Chart timeframes
const CHART_TIMEFRAMES = [
  { value: '1min', label: '1 Minute' },
  { value: '5min', label: '5 Minutes' },
  { value: '15min', label: '15 Minutes' },
  { value: '30min', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '1day', label: '1 Day' },
  { value: '1week', label: '1 Week' },
  { value: '1month', label: '1 Month' },
];

// Date formats
const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  MEDIUM: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

// Twelve Data API limits
const TWELVE_DATA_LIMITS = {
  FREE_TIER: {
    calls_per_minute: 8,
    calls_per_day: 800,
  },
  BASIC_TIER: {
    calls_per_minute: 60,
    calls_per_day: 5000,
  },
};

// Stock types
const STOCK_TYPES = [
  'Common Stock',
  'Preferred Stock',
  'ETF',
  'Index',
  'ADR',
];

// Currencies
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Watchlist limits
const WATCHLIST_LIMITS = {
  MAX_WATCHLISTS_PER_USER: 10,
  MAX_STOCKS_PER_WATCHLIST: 50,
};

// Portfolio limits
const PORTFOLIO_LIMITS = {
  MAX_HOLDINGS: 100,
};

// Alert limits
const ALERT_LIMITS = {
  MAX_ALERTS_PER_USER: 20,
  MAX_NOTIFICATIONS: 100,
};

module.exports = {
  SECTORS,
  EXCHANGES,
  FISCAL_QUARTERS,
  ALERT_FREQUENCIES,
  ALERT_TYPES,
  DSL_OPERATORS,
  DSL_LOGICAL_OPS,
  TIME_PERIODS,
  AGGREGATION_METHODS,
  FIELD_TYPES,
  SCREENER_FIELDS,
  USER_ROLES,
  RATE_LIMITS,
  HTTP_STATUS,
  ERROR_CODES,
  MARKET_CAP_RANGES,
  TECHNICAL_INDICATORS,
  CHART_TIMEFRAMES,
  DATE_FORMATS,
  TWELVE_DATA_LIMITS,
  STOCK_TYPES,
  CURRENCIES,
  WATCHLIST_LIMITS,
  PORTFOLIO_LIMITS,
  ALERT_LIMITS,
};