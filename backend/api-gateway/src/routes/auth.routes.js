const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { signup, login } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
=======
const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37

module.exports = router;
