function enrichResults(rows, dsl) {
  return rows.map(row => {
    const enriched = { ...row };

    // 1️⃣ Matched conditions (explainability)
    enriched.matched_conditions = dsl.and.map(cond => {
      return `${cond.field} ${cond.operator} ${cond.value}`;
    });

    // 2️⃣ Derived metrics (SAFE FALLBACK)
    enriched.derived_metrics = {};

    if (dsl.and.some(c => c.field === 'peg_ratio')) {
      const pe = row.pe_ratio ?? null;

      // MOCK eps growth if missing (M3 allowed)
      const epsGrowth = row.eps_growth ?? 12;

      if (pe !== null && epsGrowth > 0) {
        enriched.derived_metrics.peg_ratio =
          Number((pe / epsGrowth).toFixed(2));
      }
    }

    // 3️⃣ Time context (future-ready)
    enriched.time_context = null;

    return enriched;
  });
}

module.exports = { enrichResults };
