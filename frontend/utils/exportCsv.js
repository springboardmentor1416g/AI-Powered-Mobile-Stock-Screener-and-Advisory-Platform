export function exportToCsv(results) {
  const headers = [
    "Company",
    "Ticker",
    "PE",
    "PEG",
    "DebtToFCF",
    "MatchedConditions",
    "Timestamp"
  ];

  const rows = results.map(r => [
    r.company,
    r.ticker,
    r.derived_metrics.pe,
    r.derived_metrics.peg,
    r.derived_metrics.debt_to_fcf,
    r.matched_conditions.join("; "),
    new Date().toISOString()
  ]);

  const csv =
    [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "screener_results.csv";
  link.click();
}
