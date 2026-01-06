// const router = require("express").Router();
// const signup = require("../controllers/signup");
// const login = require("../controllers/login");

// router.post("/signup", signup.signup);
// router.post("/login", login.login);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// ✅ Fix: Use 'register' because that is what you imported from the controller
router.post("/register", register);

// Login is correct
router.post("/login", login);

module.exports = router;
