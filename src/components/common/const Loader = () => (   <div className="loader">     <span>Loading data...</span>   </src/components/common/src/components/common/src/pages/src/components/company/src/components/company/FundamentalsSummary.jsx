const FundamentalsSummary = ({ fundamentals }) => {
  if (!fundamentals) return <p>Fundamentals not available</p>;

  return (
    <section>
      <h3>Fundamentals</h3>
      <ul>
        <li>Revenue: {fundamentals.revenue}</li>
        <li>EPS: {fundamentals.eps}</li>
        <li>P/E Ratio: {fundamentals.pe}</li>
        <li>ROE: {fundamentals.roe}</li>
      </ul>
    </section>
  );
};

export default FundamentalsSummary;
