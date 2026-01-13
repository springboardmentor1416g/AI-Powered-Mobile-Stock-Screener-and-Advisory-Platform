const router = require("express").Router();
const controller = require("../controllers/portfolio.controller");
const auth = require("../middleware/auth.middleware");

router.use(auth);

router.post("/", controller.addStock);
router.put("/:symbol", controller.updateStock);
router.delete("/:symbol", controller.removeStock);
router.get("/", controller.getPortfolio);

module.exports = router;
