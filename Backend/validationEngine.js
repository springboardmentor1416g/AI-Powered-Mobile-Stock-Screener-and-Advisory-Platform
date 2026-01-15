// validationEngine.js
function validateDSL(dslQuery) {
  const errors = [];

  // Ambiguous query example
  if (dslQuery.includes("EPS") && !dslQuery.includes("last")) {
    errors.push("Time window missing for EPS condition");
  }

  // Impossible condition example
  if (dslQuery.includes("PE < 5") && dslQuery.includes("PE > 50")) {
    errors.push("Conflicting PE conditions");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateDSL };
