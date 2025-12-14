const fs = require('fs');
const csv = require('csv-parser');

async function parseSimFinCSV(filePath, statementType, onBatch) {
  return new Promise((resolve, reject) => {
    const batch = [];
    const BATCH_SIZE = 100;

    const stream = fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }));

    stream.on('data', async (row) => {
      stream.pause(); // 🔴 KEY: stop reading

      try {
        if (!row['Ticker'] || !row['Report Date']) {
          stream.resume();
          return;
        }

        batch.push({
          ticker: row['Ticker'],
          fiscal_year: parseInt(row['Fiscal Year'], 10),
          fiscal_period: row['Fiscal Period'],
          report_date: row['Report Date'],
          revenue: parseFloat(row['Revenue']) || null,
          gross_profit: parseFloat(row['Gross Profit']) || null,
          operating_income: parseFloat(row['Operating Income (Loss)']) || null,
          pretax_income: parseFloat(row['Pretax Income (Loss)']) || null,
          net_income: parseFloat(row['Net Income']) || null,
          net_income_common: parseFloat(row['Net Income (Common)']) || null,
          currency: row['Currency'] || 'USD'
        });

        if (batch.length >= BATCH_SIZE) {
          await onBatch(batch.splice(0, batch.length));
        }

        stream.resume(); // ▶️ resume reading
      } catch (err) {
        stream.destroy(err);
      }
    });

    stream.on('end', async () => {
      if (batch.length > 0) {
        await onBatch(batch);
      }
      resolve();
    });

    stream.on('error', reject);
  });
}

module.exports = { parseSimFinCSV };
