exports.addStock = async (req, res) => {
  res.json({ message: "Stock added to portfolio" });
};

exports.updateStock = async (req, res) => {
  res.json({ message: "Portfolio stock updated" });
};

exports.removeStock = async (req, res) => {
  res.json({ message: "Stock removed from portfolio" });
};

exports.getPortfolio = async (req, res) => {
  res.json({ portfolio: [] });
};
