// mock-server.js
const express = require('express');
const cors = require('cors');
const mockData = require('./mock-data/screener-responses.json');
const alertRoutes = require('./alerts.routes');
require('./alert.engine');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// ✅ REGISTER ALERT ROUTES (THIS WAS MISSING)
app.use('/api/v1/alerts', alertRoutes);

// --------- UTIL ----------
function applyDSLFilter(stocks, dslQuery) {
  let filtered = stocks;

  const peMatch = dslQuery.match(/pe_ratio\s*<\s*(\d+)/);
  if (peMatch) {
    const val = Number(peMatch[1]);
    filtered = filtered.filter(s => s.pe_ratio < val);
  }

  const priceMatch = dslQuery.match(/price\s*>\s*(\d+)/);
  if (priceMatch) {
    const val = Number(priceMatch[1]);
    filtered = filtered.filter(s => s.price > val);
  }

  return filtered;
}

// --------- HEALTH ----------
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock server running' });
});

// --------- SCREENER ----------
app.post('/api/v1/screener/execute', (req, res) => {
  const { raw_query } = req.body;

  console.log('📨 Received query:', raw_query);

  if (!raw_query || raw_query.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Empty query'
    });
  }

  const stocks = applyDSLFilter(
    mockData.success_large.stocks,
    raw_query
  );

  return res.json({
    status: 'success',
    total_matches: stocks.length,
    stocks
  });
});

// --------- WATCHLIST ----------
let watchlist = [];

app.get('/api/v1/watchlist', (req, res) => {
  res.json({ status: 'success', data: watchlist });
});

app.post('/api/v1/watchlist', (req, res) => {
  const { symbol } = req.body;
  if (!watchlist.includes(symbol)) watchlist.push(symbol);
  res.json({ status: 'success', message: `${symbol} added to watchlist` });
});

app.delete('/api/v1/watchlist/:symbol', (req, res) => {
  watchlist = watchlist.filter(s => s !== req.params.symbol);
  res.json({ status: 'success', message: 'Removed from watchlist' });
});

// --------- START ----------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
