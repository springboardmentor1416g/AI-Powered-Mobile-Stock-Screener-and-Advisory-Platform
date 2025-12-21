const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const metadataRoutes = require('./metadataRoutes');

/**
 * API Routes
 * All routes are prefixed with /api/v1
 */

// Health check routes
router.use('/health', healthRoutes);

// Metadata routes
router.use('/metadata', metadataRoutes);

module.exports = router;
