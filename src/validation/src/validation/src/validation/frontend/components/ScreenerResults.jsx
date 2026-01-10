import React from "react";

const ScreenerResults = ({ results }) => {
  return (
    <div>
      <h2>Advanced Screener Results</h2>
      {results.map((stock) => (
        <div key={stock.ticker} className="result-card">
          <h3>{stock.companyName} ({stock.ticker})</h3>
          <p><b>Matched Conditions:</b> {stock.matchedConditions.join(", ")}</p>
          <p><b>Derived Metrics:</b> PEG: {stock.peg}, PE: {stock.pe}</p>
          <p><b>Context:</b> {stock.timeWindow}</p>
        </div>
      ))}
    </div>
  );
};

export default ScreenerResults;
