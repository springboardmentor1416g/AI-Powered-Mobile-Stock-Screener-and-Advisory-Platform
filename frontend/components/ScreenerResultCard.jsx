export default function ScreenerResultCard({ result, onSelect }) {
  return (
    <div className="card" onClick={() => onSelect(result)}>
      <h3>{result.company} ({result.ticker})</h3>

      <DerivedMetricsCard metrics={result.derived_metrics} />

      <div>
        <strong>Why it matched:</strong>
        <ul>
          {result.matched_conditions.map((c, i) => (
            <li key={i}>✔ {c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
