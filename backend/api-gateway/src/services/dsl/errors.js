class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.type = "VALIDATION_ERROR";
    this.code = code;
  }
}

module.exports = { ValidationError };
