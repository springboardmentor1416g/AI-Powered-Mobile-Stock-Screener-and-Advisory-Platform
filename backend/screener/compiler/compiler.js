function compileScreener(dsl) {
  if (!dsl || !dsl.conditions || dsl.conditions.length === 0) {
    throw new Error("No conditions found in DSL");
  }

  const clauses = [];
  const values = [];
  let paramIndex = 1;

  const fieldMap = {
    "sector": "c.sector",
    "industry": "c.industry",
    "market_cap": "c.market_cap",
    "exchange": "c.exchange",
    "name": "c.name",
    "ticker": "c.ticker",
    "revenue": "f.revenue",
    "net_income": "f.net_income",
    "profit": "f.net_income",
    "eps": "f.eps",
    "pe": "f.pe_ratio",
    "pe_ratio": "f.pe_ratio",
    "roe": "f.roe",
    "price": "p.close",
    "stock_price": "p.close",
    "close": "p.close",
    "volume": "p.volume"
  };

  dsl.conditions.forEach(condition => {
    const { field, value } = condition;
    let { operator } = condition; // Let us modify this

    const dbField = fieldMap[field.toLowerCase()];
    if (!dbField) throw new Error(`Unknown field: ${field}`);

    // ---------------------------------------------------------
    // 🔧 THE FIX IS HERE (Step 2)
    // ---------------------------------------------------------
    // If AI says "NOT IN" but gives a single string (not a list),
    // we MUST change it to "!=" or Postgres will crash.
    if (operator.toUpperCase() === "NOT IN") {
       if (!Array.isArray(value)) {
          // It's a single word (e.g., "Software"), so use !=
          operator = "!=";
       }
    }
    // ---------------------------------------------------------

    // 3. Add 'NOT IN' to the allowed list (Whitelist)
    const validOps = [
      ">", "<", "=", ">=", "<=", "!=", "<>", 
      "LIKE", "ILIKE", 
      "IN", "NOT IN"  // <--- Ensure this is here
    ];

    if (!validOps.includes(operator.toUpperCase())) {
      throw new Error(`Invalid operator: ${operator}`);
    }

    clauses.push(`${dbField} ${operator} $${paramIndex}`);
    values.push(value);
    paramIndex++;
  });

  const logicOperator = dsl.type === "OR" ? " OR " : " AND ";
  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(logicOperator)}` : "";

  const sqlQuery = `
    SELECT DISTINCT ON (c.ticker)
      c.ticker, c.name, c.sector, c.industry, 
      f.revenue, f.pe_ratio,
      p.close as stock_price
    FROM companies c
    LEFT JOIN fundamentals_quarterly f ON c.ticker = f.ticker 
    LEFT JOIN price_history p ON c.ticker = p.ticker
    ${whereClause}
    ORDER BY c.ticker, p.time DESC
    LIMIT 50;
  `;

  return { text: sqlQuery, values: values };
}

module.exports = { compileScreener };