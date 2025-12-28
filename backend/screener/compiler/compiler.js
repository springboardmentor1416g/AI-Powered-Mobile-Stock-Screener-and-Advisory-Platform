function compileScreener(dsl) {
  if (!dsl || !dsl.conditions || dsl.conditions.length === 0) {
    throw new Error("No conditions found in DSL");
  }

  const clauses = [];
  const values = [];
  let paramIndex = 1;

  // Map fields to specific tables
  // c = companies table, f = fundamentals_quarterly table
  const fieldMap = {
    // From 'companies' table
    "sector": "c.sector",
    "industry": "c.industry",
    "market_cap": "c.market_cap",
    "exchange": "c.exchange",
    "name": "c.name",
    "ticker": "c.ticker",

    // From 'fundamentals_quarterly' table
    "revenue": "f.revenue",
    "net_income": "f.net_income",
    "eps": "f.eps",
    "pe": "f.pe_ratio",
    "roe": "f.roe"
  };

  dsl.conditions.forEach(condition => {
    const { field, operator, value } = condition;
    const dbField = fieldMap[field.toLowerCase()];

    if (!dbField) throw new Error(`Unknown field: ${field}`);

    // Basic SQL Injection protection for operators
    const validOps = [">", "<", "=", ">=", "<=", "!=", "LIKE"];
    if (!validOps.includes(operator)) throw new Error(`Invalid operator: ${operator}`);

    clauses.push(`${dbField} ${operator} $${paramIndex}`);
    values.push(value);
    paramIndex++;
  });

  const logicOperator = dsl.type === "OR" ? " OR " : " AND ";
  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(logicOperator)}` : "";

  // JOIN Query: Connects Company Info with Financial Data
  // Uses DISTINCT ON to ensure we only get one result per ticker
  const sqlQuery = `
    SELECT DISTINCT ON (c.ticker) 
      c.ticker, c.name, c.sector, c.industry, c.market_cap,
      f.revenue, f.net_income, f.pe_ratio
    FROM companies c
    LEFT JOIN fundamentals_quarterly f ON c.ticker = f.ticker
    ${whereClause}
    ORDER BY c.ticker, f.created_at DESC
    LIMIT 50;
  `;

  return {
    text: sqlQuery,
    values: values
  };
}

module.exports = { compileScreener };