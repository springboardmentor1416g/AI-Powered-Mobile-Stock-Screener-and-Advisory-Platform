const ALLOWED_FIELDS = [
  'pe_ratio',
  'revenue',
  'revenue_growth_yoy',
  'net_profit'
];

const ALLOWED_OPERATORS = ['<', '>', '<=', '>=', '=', '!='];

function validateCondition(condition) {
  if (!condition.field || !ALLOWED_FIELDS.includes(condition.field)) {
    throw new Error(`Unsupported field: ${condition.field}`);
  }

  if (!condition.operator || !ALLOWED_OPERATORS.includes(condition.operator)) {
    throw new Error(`Unsupported operator: ${condition.operator}`);
  }

  if (condition.value === undefined) {
    throw new Error(`Missing value for field: ${condition.field}`);
  }
}

function validateGroup(group) {
  for (const item of group) {
    if (item.and) {
      validateGroup(item.and);
    } else if (item.or) {
      validateGroup(item.or);
    } else {
      validateCondition(item);
    }
  }
}

module.exports = function validateDSL(dsl) {
  if (!dsl.filter || !dsl.filter.and) {
    throw new Error('DSL must contain an AND filter');
  }

  validateGroup(dsl.filter.and);
};
