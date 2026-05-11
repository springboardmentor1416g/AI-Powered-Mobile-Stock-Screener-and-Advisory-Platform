function safeDivide(a, b, metricName) {
  if (b === 0 || b === null || b === undefined) {
    throw new Error(`Unsafe division in ${metricName}`);
  }
  return a / b;
}

module.exports = { safeDivide };