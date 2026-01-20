const { FIELD_MAP } = require("./fieldMap");

function isObject(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/**
 * DSL expected:
 * {
 *   filter: { and:[...]/or:[...]/not:{} } OR {field, operator, value, ...}
 *   meta?: { sector, exchange }
 * }
 */

function compileCondition(node, params) {
  assert(isObject(node), "Condition must be an object");

  // LOGIC node
  if (node.and || node.or || node.not) {
    const keys = ["and", "or", "not"].filter((k) => node[k] !== undefined);
    assert(keys.length === 1, "Only one of and/or/not is allowed per node");

    if (node.and) {
      assert(Array.isArray(node.and) && node.and.length > 0, "and must be a non-empty array");
      const parts = node.and.map((c) => `(${compileCondition(c, params)})`);
      return parts.join(" AND ");
    }

    if (node.or) {
      assert(Array.isArray(node.or) && node.or.length > 0, "or must be a non-empty array");
      const parts = node.or.map((c) => `(${compileCondition(c, params)})`);
      return parts.join(" OR ");
    }

    // not
    assert(isObject(node.not), "not must be an object condition");
    return `NOT (${compileCondition(node.not, params)})`;
  }

  // LEAF node
  const { field, operator, value } = node;
  assert(typeof field === "string" && field.length > 0, "field is required");
  assert(typeof operator === "string" && operator.length > 0, "operator is required");

  const col = FIELD_MAP[field];
  assert(col, `Unsupported field: ${field}`);

  const safeCol = `"${col}"`; // column name from whitelist

  switch (operator) {
    case "<":
    case ">":
    case "<=":
    case ">=":
    case "=":
    case "!=": {
      assert(value !== undefined, `value is required for operator ${operator}`);
      params.push(value);
      return `${safeCol} ${operator} $${params.length}`;
    }

    case "between": {
      assert(Array.isArray(value) && value.length === 2, "between requires value: [min, max]");
      params.push(value[0]);
      const p1 = `$${params.length}`;
      params.push(value[1]);
      const p2 = `$${params.length}`;
      return `${safeCol} BETWEEN ${p1} AND ${p2}`;
    }

    case "in": {
      assert(Array.isArray(value) && value.length > 0, "in requires a non-empty array");
      const placeholders = value.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      return `${safeCol} IN (${placeholders.join(", ")})`;
    }

    case "exists": {
      // value can be true/false or omitted; default true
      const wantExists = value === undefined ? true : !!value;
      return wantExists ? `${safeCol} IS NOT NULL` : `${safeCol} IS NULL`;
    }

    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function compileDSL(dsl) {
  assert(isObject(dsl), "DSL body must be an object");
  assert(isObject(dsl.filter), "DSL must have 'filter' object");

  const params = [];
  const where = compileCondition(dsl.filter, params);

  // meta filters (companies table)
  const meta = dsl.meta && isObject(dsl.meta) ? dsl.meta : {};
  const metaClauses = [];

  if (meta.sector) {
    params.push(meta.sector);
    metaClauses.push(`c.sector = $${params.length}`);
  }
  if (meta.exchange) {
    params.push(meta.exchange);
    metaClauses.push(`c.exchange = $${params.length}`);
  }

  const finalWhere =
    metaClauses.length > 0 ? `(${where}) AND (${metaClauses.join(" AND ")})` : where;

  return { where: finalWhere, params };
}

module.exports = { compileDSL };