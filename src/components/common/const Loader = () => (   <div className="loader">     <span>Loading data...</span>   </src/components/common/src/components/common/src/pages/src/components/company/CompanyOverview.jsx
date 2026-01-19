const CompanyOverview = ({ company }) => {
  if (!company) return null;

  return (
    <section>
      <h2>{company.name} ({company.ticker})</h2>
      <p>Sector: {company.sector}</p>
      <p>Market Cap: {company.marketCap}</p>
      <p>Price: ₹{company.price} ({company.change}%)</p>
    </section>
  );
};

export default CompanyOverview;
