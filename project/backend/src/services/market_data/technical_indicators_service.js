const db = require('../../config/database');
const logger = require('../../config/logger');

function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

// Wilder RSI
function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function pctReturn(newer, older) {
  if (older === 0 || older == null || newer == null) return null;
  return ((newer - older) / older) * 100;
}

class TechnicalIndicatorsService {
  async computeForTicker(ticker) {
    // IMPORTANT: this must match your DB table/columns
    const q = `
      SELECT time::date AS d, close::numeric AS close
      FROM price_history
      WHERE ticker = $1
      ORDER BY time ASC
    `;
    const res = await db.query(q, [ticker]);

    if (res.rows.length < 15) {
      return { success: false, error: 'Not enough price data (need >= 15 closes)' };
    }

    const closes = res.rows.map(r => Number(r.close));
    const n = closes.length;

    const last = closes[n - 1];
    const close20 = n >= 20 ? closes[n - 20] : null;
    const close63 = n >= 63 ? closes[n - 63] : null;
    const close126 = n >= 126 ? closes[n - 126] : null;

    const payload = {
      rsi_14: rsi(closes, 14),
      sma_20: sma(closes, 20),
      sma_50: sma(closes, 50),
      sma_200: sma(closes, 200),
      ret_1m: close20 ? pctReturn(last, close20) : null,
      ret_3m: close63 ? pctReturn(last, close63) : null,
      ret_6m: close126 ? pctReturn(last, close126) : null,
    };

    const upsert = `
      INSERT INTO technical_indicators_latest
        (ticker, asof_time, rsi_14, sma_20, sma_50, sma_200, ret_1m, ret_3m, ret_6m, updated_at)
      VALUES
        ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (ticker) DO UPDATE SET
        asof_time = NOW(),
        rsi_14 = EXCLUDED.rsi_14,
        sma_20 = EXCLUDED.sma_20,
        sma_50 = EXCLUDED.sma_50,
        sma_200 = EXCLUDED.sma_200,
        ret_1m = EXCLUDED.ret_1m,
        ret_3m = EXCLUDED.ret_3m,
        ret_6m = EXCLUDED.ret_6m,
        updated_at = NOW()
    `;

    await db.query(upsert, [
      ticker,
      payload.rsi_14,
      payload.sma_20,
      payload.sma_50,
      payload.sma_200,
      payload.ret_1m,
      payload.ret_3m,
      payload.ret_6m,
    ]);

    return { success: true, data: payload };
  }

  async computeAll(limit = null) {
    const tickersRes = await db.query(
      `SELECT ticker FROM companies ORDER BY ticker ${limit ? 'LIMIT ' + Number(limit) : ''}`
    );

    const results = { success: [], failed: [] };

    for (const row of tickersRes.rows) {
      const t = row.ticker;
      try {
        const r = await this.computeForTicker(t);
        if (r.success) results.success.push(t);
        else results.failed.push({ ticker: t, error: r.error });
      } catch (e) {
        logger.error(`Indicator compute failed for ${t}`, e);
        results.failed.push({ ticker: t, error: e.message });
      }
    }
    return results;
  }
}

module.exports = new TechnicalIndicatorsService();
