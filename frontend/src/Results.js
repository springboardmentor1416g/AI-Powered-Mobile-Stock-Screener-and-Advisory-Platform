import React from "react";

function Results({ results }) {
  if (!results || results.length === 0) {
    return <p>No results found</p>;
  }

  return (
    <div>
      <h3>Results</h3>
      {results.map((stock, index) => (
        <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <p><b>{stock.company}</b> ({stock.symbol})</p>
          <p>Price: ₹{stock.price}</p>
          <p>Market Cap: {stock.marketCap}</p>
        </div>
      ))}
    </div>
  );
}

export default Results;
