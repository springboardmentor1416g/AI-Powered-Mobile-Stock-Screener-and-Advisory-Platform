module.exports = {
  REQUIRED_METRICS: [
    'revenue',
    'net_income'
  ],

  OUTLIER_LIMITS: {
    QOQ_SPIKE_PERCENT: 300,
    PRICE_SPIKE_PERCENT: 40,
    STD_MULTIPLIER: 4
  },

  ALLOWED_CURRENCIES: ['USD', 'INR']
};
