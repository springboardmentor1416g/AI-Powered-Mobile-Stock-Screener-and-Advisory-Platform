export const formatCurrency = (value) =>
  typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '₹0';

export const formatPercent = (value) =>
  typeof value === 'number' ? `${value.toFixed(2)}%` : '0%';

export const trimText = (text, max = 90) =>
  text.length > max ? `${text.slice(0, max)}…` : text;