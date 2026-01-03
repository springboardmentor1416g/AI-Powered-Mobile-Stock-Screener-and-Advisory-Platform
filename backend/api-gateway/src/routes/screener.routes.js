const router = require("express").Router();
const { runScreenerHandler } = require("../controllers/screener.controller");

router.post("/run", runScreenerHandler);

module.exports = router;
