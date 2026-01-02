const { runScreener } = require("../services/screener/runner");

async function runScreenerHandler(req, res, next) {
  try {
    const dsl = req.body;
    const limit = req.query.limit ? Number(req.query.limit) : 200;

    const rows = await runScreener({ pool: req.app.locals.db, dsl, limit });

    res.json({ success: true, count: rows.length, results: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { runScreenerHandler };
