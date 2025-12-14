module.exports.fetchStocks = async () => {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', exchange: 'NASDAQ' }
  ];
};
