export default function CompanyOverview({ data }: any) {
  return (
    <div className="bg-white shadow p-4 rounded">
      <h1 className="text-xl font-bold">{data.name} ({data.ticker})</h1>
      <p className="text-gray-600">{data.sector} • {data.industry}</p>

      <div className="mt-3 flex justify-between">
        <span>Price: ₹{data.price}</span>
        <span className={data.change >= 0 ? "text-green-600" : "text-red-600"}>
          {data.change}%
        </span>
      </div>
    </div>
  );
}
