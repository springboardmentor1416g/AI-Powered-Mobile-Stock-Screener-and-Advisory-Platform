// backend/api-gateway/src/controllers/screener.controller.js
const { runScreener } = require("../services/screener/runner");

async function runScreenerHandler(req, res, next) {
  try {
    const dsl = req.body;
    const limit = req.query.limit ? Number(req.query.limit) : 200;

    const rows = await runScreener({
      pool: req.app.locals.db,
      dsl,
      limit,
    });

    return res.json({ success: true, count: rows.length, results: rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = { runScreenerHandler };
