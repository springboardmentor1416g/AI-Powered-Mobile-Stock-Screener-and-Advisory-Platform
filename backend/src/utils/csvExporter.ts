import { CompanyScreenerResult } from "../types/screener.types";

export function exportToCSV(results: CompanyScreenerResult[]) {
  const header = [
    "Ticker",
    "Name",
    "Matched Conditions",
    "PE",
    "PEG",
    "DebtToFCF",
    "Timestamp"
  ];

  const rows = results.map((r) => [
    r.ticker,
    r.name,
    r.matchedConditions.join("; "),
    r.derivedMetrics.pe ?? "",
    r.derivedMetrics.peg ?? "",
    r.derivedMetrics.debtToFCF ?? "",
    new Date().toISOString()
  ]);

  return [header, ...rows]
    .map((row) => row.join(","))
    .join("\n");
}
