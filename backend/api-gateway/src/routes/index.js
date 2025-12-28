const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const metadataRoutes = require('./metadataRoutes');
const authRoutes = require('./auth');
const screenerRoutes = require('./screener');

// Health check routes
router.use('/health', healthRoutes);

// Metadata routes
router.use('/metadata', metadataRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Screener routes
router.use('/screener', screenerRoutes);

module.exports = router;
