export const exportToCSV = (results) => {
  const headers = [
    "Company",
    "Ticker",
    "PEG",
    "PE",
    "Matched Conditions",
    "Timestamp"
  ];

  const rows = results.map(r => [
    r.companyName,
    r.ticker,
    r.peg,
    r.pe,
    r.matchedConditions.join("; "),
    new Date().toISOString()
  ]);

  const csvContent =
    [headers, ...rows].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "screener_results.csv";
  link.click();
};
