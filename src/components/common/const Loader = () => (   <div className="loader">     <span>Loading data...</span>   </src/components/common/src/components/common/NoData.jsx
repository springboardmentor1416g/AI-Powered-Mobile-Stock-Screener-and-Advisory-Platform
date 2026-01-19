
const NoData = ({ message }) => (
  <div className="no-data">
    <p>{message || "Data not available for this section"}</p>
  </div>
);

export default NoData;
