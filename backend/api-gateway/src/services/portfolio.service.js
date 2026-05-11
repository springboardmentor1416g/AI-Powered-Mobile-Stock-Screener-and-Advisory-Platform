// In-memory portfolio store (replace with DB later)
let portfolios = {};

const getOrCreateUserPortfolio = (userId = 'default-user') => {
  if (!portfolios[userId]) {
    portfolios[userId] = {
      holdings: [],
      totalInvested: 0,
      currentValue: 0,
      totalReturn: 0,
      returnPercent: 0
    };
  }
  return portfolios[userId];
};

const addHolding = (symbol, stockData, quantity, costPrice, userId = 'default-user') => {
  const portfolio = getOrCreateUserPortfolio(userId);
  const holding = portfolio.holdings.find(h => h.symbol === symbol);

  const investmentAmount = quantity * costPrice;

  if (holding) {
    const totalQty = holding.quantity + quantity;
    const totalCost = holding.totalCost + investmentAmount;
    holding.avgCostPrice = totalCost / totalQty;
    holding.quantity = totalQty;
    holding.totalCost = totalCost;
  } else {
    portfolio.holdings.push({
      symbol,
      name: stockData.name,
      sector: stockData.sector,
      quantity,
      costPrice,
      avgCostPrice: costPrice,
      totalCost: investmentAmount,
      currentPrice: stockData.price || costPrice,
      currentValue: quantity * (stockData.price || costPrice),
      gain: quantity * ((stockData.price || costPrice) - costPrice),
      gainPercent: ((stockData.price || costPrice) - costPrice) / costPrice * 100,
      addedAt: new Date().toISOString(),
      ...stockData
    });
  }

  updatePortfolioMetrics(portfolio);
  return portfolio;
};

const removeHolding = (symbol, userId = 'default-user') => {
  const portfolio = getOrCreateUserPortfolio(userId);
  portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
  updatePortfolioMetrics(portfolio);
  return portfolio;
};

const updateHolding = (symbol, quantity, costPrice, userId = 'default-user') => {
  const portfolio = getOrCreateUserPortfolio(userId);
  const holding = portfolio.holdings.find(h => h.symbol === symbol);

  if (holding) {
    holding.quantity = quantity;
    holding.costPrice = costPrice;
    holding.totalCost = quantity * costPrice;
    holding.avgCostPrice = costPrice;
    holding.currentValue = quantity * holding.currentPrice;
    holding.gain = quantity * (holding.currentPrice - costPrice);
    holding.gainPercent = (holding.currentPrice - costPrice) / costPrice * 100;
  }

  updatePortfolioMetrics(portfolio);
  return portfolio;
};

const updatePortfolioMetrics = (portfolio) => {
  portfolio.totalInvested = portfolio.holdings.reduce((sum, h) => sum + h.totalCost, 0);
  portfolio.currentValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
  portfolio.totalReturn = portfolio.currentValue - portfolio.totalInvested;
  portfolio.returnPercent = portfolio.totalInvested > 0 ? (portfolio.totalReturn / portfolio.totalInvested) * 100 : 0;
};

const getPortfolio = (userId = 'default-user') => {
  return getOrCreateUserPortfolio(userId);
};

const getHolding = (symbol, userId = 'default-user') => {
  const portfolio = getOrCreateUserPortfolio(userId);
  return portfolio.holdings.find(h => h.symbol === symbol);
};

module.exports = {
  addHolding,
  removeHolding,
  updateHolding,
  getPortfolio,
  getHolding,
  getOrCreateUserPortfolio
};
