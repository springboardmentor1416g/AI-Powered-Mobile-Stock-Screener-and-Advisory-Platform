import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import NoData from "../components/common/NoData";

import CompanyOverview from "../components/company/CompanyOverview";
import FundamentalsSummary from "../components/company/FundamentalsSummary";
import PriceChart from "../components/charts/PriceChart";
import NewsFeed from "../components/company/NewsFeed";

import {
  fetchCompanyDetail,
  fetchCompanyFundamentals,
  fetchCompanyPriceHistory
} from "../api/companyApi";

export default function CompanyDetailPage() {
  const { ticker } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<any>(null);
  const [fundamentals, setFundamentals] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [c, f, p] = await Promise.all([
          fetchCompanyDetail(ticker!),
          fetchCompanyFundamentals(ticker!),
          fetchCompanyPriceHistory(ticker!)
        ]);
        setCompany(c.data);
        setFundamentals(f.data || []);
        setPrices(p.data || []);
      } catch {
        setError("Failed to load company data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticker]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="p-4 space-y-6">
      <CompanyOverview data={company} />
      <FundamentalsSummary data={fundamentals} />
      {prices.length > 0 ? (
        <PriceChart data={prices} />
      ) : (
        <NoData text="Price history not available" />
      )}
      <NewsFeed ticker={ticker!} />
    </div>
  );
}
