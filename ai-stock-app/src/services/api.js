import axios from 'axios';

const API = axios.create({
  baseURL: 'https://example.com/api', // replace with your backend later
  timeout: 8000,
});

// Mock data until backend is ready
const MOCK_STOCKS = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4012.5, changePct: 0.85, sector: 'IT', pe: 28.4, marketCap: 145000 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2475.9, changePct: -0.35, sector: 'Energy', pe: 22.1, marketCap: 170000 },
  { symbol: 'INFY', name: 'Infosys', price: 1565.3, changePct: 1.12, sector: 'IT', pe: 25.2, marketCap: 90_000 },
];

export async function fetchStocks(filters = {}) {
  // Replace this with: const { data } = await API.get('/stocks', { params: filters });
  let data = MOCK_STOCKS;

  if (filters.sector) data = data.filter(s => s.sector === filters.sector);
  if (filters.maxPE) data = data.filter(s => s.pe <= Number(filters.maxPE));
  if (filters.minCap) data = data.filter(s => s.marketCap >= Number(filters.minCap));

  return data;
}

export async function fetchStockDetail(symbol) {
  // Replace with API call later
  const stock = MOCK_STOCKS.find(s => s.symbol === symbol);
  return stock || null;
}