class DSLValidationError extends Error {
  constructor({ code, message, field = null }) {
    super(message);
    this.name = 'DSLValidationError';
    this.code = code;
    this.field = field;
    this.type = 'VALIDATION_ERROR';
  }
}

module.exports = { DSLValidationError };
