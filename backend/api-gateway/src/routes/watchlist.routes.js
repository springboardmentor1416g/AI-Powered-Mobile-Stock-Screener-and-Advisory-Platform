const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/watchlist.controller");

router.post("/add", auth, controller.add);
router.get("/", auth, controller.list);
router.delete("/remove/:ticker", auth, controller.remove);

module.exports = router;
