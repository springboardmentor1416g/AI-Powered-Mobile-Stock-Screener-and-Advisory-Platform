import CompanyOverview from "../components/company/CompanyOverview";
import FundamentalsSummary from "../components/company/FundamentalsSummary";
import NewsFeed from "../components/company/NewsFeed";

const CompanyDetail = () => {
  return (
    <div className="company-detail">
      <CompanyOverview />
      <FundamentalsSummary />
      <NewsFeed />
    </div>
  );
};

export default CompanyDetail;
