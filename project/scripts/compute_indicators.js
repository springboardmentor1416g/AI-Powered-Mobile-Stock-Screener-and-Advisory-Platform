require('dotenv').config();
const service = require('../src/services/market_data/technical_indicators_service');
const logger = require('../src/config/logger');

(async () => {
  try {
    const limit = process.argv[2] ? Number(process.argv[2]) : null;
    const result = await service.computeAll(limit);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
