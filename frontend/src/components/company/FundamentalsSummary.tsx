export default function FundamentalsSummary({ data }: any) {
  if (!data.length) return <NoData text="Fundamentals not available" />;

  const latest = data[0];

  return (
    <div className="bg-white shadow p-4 rounded grid grid-cols-2 gap-4">
      <div>Revenue (TTM): ₹{latest.revenue_ttm}</div>
      <div>EPS (TTM): {latest.eps_ttm}</div>
      <div>PE: {latest.pe}</div>
      <div>PEG: {latest.peg}</div>
      <div>Debt / FCF: {latest.debt_to_fcf}</div>
    </div>
  );
}
