const router = require("express").Router();
const signup = require("../controllers/signup");
const login = require("../controllers/login");

router.post("/signup", signup.signup);
router.post("/login", login.login);

module.exports = router;
