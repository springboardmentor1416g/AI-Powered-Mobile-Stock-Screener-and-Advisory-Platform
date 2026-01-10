import React from "react";

const CompanyDetailView = ({ company }) => {
  return (
    <div>
      <h2>{company.name} Fundamentals</h2>

      <h3>Quarterly Metrics</h3>
      <ul>
        <li>Revenue: {company.quarterly.revenue}</li>
        <li>EPS: {company.quarterly.eps}</li>
        <li>EBITDA: {company.quarterly.ebitda}</li>
      </ul>

      <h3>TTM Metrics</h3>
      <ul>
        <li>Revenue (TTM): {company.ttm.revenue}</li>
        <li>EPS (TTM): {company.ttm.eps}</li>
        <li>PEG Ratio: {company.peg}</li>
      </ul>

      <h3>Trend Indicators</h3>
      <p>EPS Trend: {company.trend}</p>
    </div>
  );
};

export default CompanyDetailView;
