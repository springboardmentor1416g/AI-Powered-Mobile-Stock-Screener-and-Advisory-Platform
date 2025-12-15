const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/auth.middleware');

router.get('/secure-test', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'You accessed a protected route',
    user: req.user
  });
});

module.exports = router;
