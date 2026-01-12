function ruleParseScreener(query) {
  const q = (query || "").toUpperCase();

  const out = { intent: "STOCK_SCREEN", filters: {} };

  // sector heuristic
  if (q.includes(" IT ") || q.includes("IT STOCK") || q.includes("IT STOCKS")) {
    out.filters.sector = "IT";
  }

  // PE < number
  const peLt = q.match(/\bPE\s*<\s*(\d+(\.\d+)?)\b/);
  if (peLt) out.filters.pe_lt = Number(peLt[1]);

  const peGt = q.match(/\bPE\s*>\s*(\d+(\.\d+)?)\b/);
  if (peGt) out.filters.pe_gt = Number(peGt[1]);

  return out;
}

module.exports = { ruleParseScreener };
