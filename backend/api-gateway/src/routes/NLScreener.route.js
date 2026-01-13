const router = require("express").Router();
const { runNlScreener } = require("../controllers/nlScreener.controller");

router.post("/run", runNlScreener);

module.exports = router;