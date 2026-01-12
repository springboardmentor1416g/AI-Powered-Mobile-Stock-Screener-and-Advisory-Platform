export default function DerivedMetricsCard({ metrics }) {
  return (
    <div className="metrics">
      <span>PE: {metrics.pe}</span>
      <span>PEG: {metrics.peg}</span>
      <span>Debt/FCF: {metrics.debt_to_fcf}</span>
    </div>
  );
}
