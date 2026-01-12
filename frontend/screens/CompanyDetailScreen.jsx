import TrendIndicator from "../components/TrendIndicator";

export default function CompanyDetailScreen({ data }) {
  return (
    <div>
      <h2>{data.company} ({data.ticker})</h2>

      <h3>Derived Metrics</h3>
      <p>PE: {data.derived_metrics.pe}</p>
      <p>PEG: {data.derived_metrics.peg}</p>
      <p>Debt / FCF: {data.derived_metrics.debt_to_fcf}</p>

      <h3>TTM Metrics</h3>
      <ul>
        <li>Revenue: {data.ttm.revenue}</li>
        <li>EPS: {data.ttm.eps}</li>
        <li>EBITDA: {data.ttm.ebitda}</li>
        <li>FCF: {data.ttm.fcf}</li>
      </ul>

      <h3>Quarterly Performance</h3>
      <table>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>EPS</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.quarterly.map((q, i) => (
            <tr key={i}>
              <td>{q.q}</td>
              <td>{q.eps}</td>
              <td>{q.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Trends</h3>
      <p>EPS <TrendIndicator value={data.trends.eps} /></p>
      <p>Revenue <TrendIndicator value={data.trends.revenue} /></p>
    </div>
  );
}
