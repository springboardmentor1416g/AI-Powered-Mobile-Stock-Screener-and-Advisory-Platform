function buildWhereClause(dsl) {
  const conditions = [];
  const values = [];

  let idx = 1;

  if (dsl.pe) {
    conditions.push(`pe ${dsl.pe.operator} $${idx++}`);
    values.push(dsl.pe.value);
  }

  if (dsl.promoterHolding) {
    conditions.push(`promoter_holding ${dsl.promoterHolding.operator} $${idx++}`);
    values.push(dsl.promoterHolding.value);
  }

  if (dsl.positiveEarnings) {
    conditions.push(`positive_earnings = true`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { where, values };
}

module.exports = { buildWhereClause };
