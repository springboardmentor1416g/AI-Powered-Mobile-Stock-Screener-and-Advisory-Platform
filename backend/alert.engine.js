const { alerts, notifications } = require('./alerts.store');
const mockData = require('./mock-data/screener-responses.json');

setInterval(() => {
  alerts.forEach(alert => {
    const stock = mockData.success_large.stocks.find(
      s => s.symbol === alert.symbol
    );

    if (!stock) return;

    let conditionMet = false;

    if (alert.type === 'price') {
      conditionMet = stock.price < alert.value;
    }

    if (alert.type === 'pe') {
      conditionMet = stock.pe_ratio < alert.value;
    }

    if (conditionMet && !alert.lastTriggered) {
      alert.lastTriggered = Date.now();

      notifications.push({
        time: new Date().toISOString(),
        message: `${alert.symbol} triggered alert (${alert.type} < ${alert.value})`
      });

      console.log('🔔 ALERT TRIGGERED:', alert.symbol);
    }
  });
}, 10000); // every 10 seconds
