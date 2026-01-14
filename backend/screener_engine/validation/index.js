// Use v2 validation which includes all extended features
const validateDSLv2 = require('./validate_dsl_v2');

function validateDSL(dsl) {
  // Check DSL version - default to v2 for extended features
  const version = dsl?.meta?.dsl_version || '2.0';
  
  if (version === '2.0' || version >= 2.0) {
    validateDSLv2(dsl);
  } else {
    // Fallback to basic validation for v1
    const validateStructure = require('./validate_structure');
    const validateLogic = require('./validate_logic');
    const validateMetrics = require('./validate_metrics');
    
    validateStructure(dsl);
    validateLogic(dsl);
    validateMetrics(dsl);
  }
}

module.exports = validateDSL;
