// Simple rule-based advisory until you connect a real AI backend
export function getAdvisoryFor(stock) {
  if (!stock) return { rating: 'Hold', rationale: 'Insufficient data.' };

  const points = [];
  let score = 0;

  if (stock.changePct > 1) {
    score += 1; points.push('Strong recent momentum.');
  }
  if (stock.pe < 20) {
    score += 1; points.push('Valuation below market average.');
  }
  if (stock.sector === 'IT') {
    score += 0.5; points.push('Sector tailwinds for IT services.');
  }
  if (stock.marketCap > 120000) {
    score += 0.5; points.push('Large-cap stability.');
  }

  const rating = score >= 2.5 ? 'Buy' : score >= 1.5 ? 'Hold' : 'Watch';
  return { rating, rationale: points.join(' ') };
}