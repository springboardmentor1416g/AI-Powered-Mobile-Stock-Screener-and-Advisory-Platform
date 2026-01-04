const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
<<<<<<< HEAD

router.get("/", auth, (req, res) => {
  res.json({
    message: "Protected watchlist route",
    user: req.user
  });
});
=======
const controller = require("../controllers/watchlist.controller");

router.post("/add", auth, controller.add);
router.get("/", auth, controller.list);
router.delete("/remove/:ticker", auth, controller.remove);
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37

module.exports = router;
