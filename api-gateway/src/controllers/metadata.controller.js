export const getStocks = (req, res) => {
  res.json([
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "INFY", name: "Infosys Ltd", sector: "IT" }
  ]);
};
