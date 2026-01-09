class DerivedMetricError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DerivedMetricError';
    this.code = code;
  }
}

module.exports = { DerivedMetricError };
