const router = require("express").Router();
const { runScreener } = require("../controllers/screener.controller");

router.post("/run", runScreener);

module.exports = router;
