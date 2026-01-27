/**
 * Screener Routes
 * Handles stock screening queries and saved screens
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const screenerRunner = require('../services/screener/screener_runner');
const llmParser = require('../services/llm/llm_parser');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/v1/screener/run
 * Run a screening query
 */
router.post('/run', optionalAuth, async (req, res) => {
  try {
    const { filter, query: nlQuery, options } = req.body;

    if (!filter && !nlQuery) {
      return res.status(400).json({
        success: false,
        message: 'Either filter or query is required',
      });
    }

    let filterObj = filter;

    // If natural language query provided, parse it
    if (nlQuery && !filter) {
      const parseResult = await llmParser.parse(nlQuery);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to parse query',
          error: parseResult.error,
        });
      }
      filterObj = parseResult.filter;
    }

    // Run the screen
    const result = await screenerRunner.run(filterObj, options || {});

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/screener/parse
 * Parse natural language query
 */
router.post('/parse', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    const result = await llmParser.parse(query);

    // Add explanation
    if (result.success && result.filter) {
      result.explanation = llmParser.explainFilter(result.filter);
      result.validation = llmParser.validateFilter(result.filter);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/screener/validate
 * Validate a filter
 */
router.post('/validate', async (req, res) => {
  try {
    const { filter } = req.body;

    if (!filter) {
      return res.status(400).json({
        success: false,
        message: 'Filter is required',
      });
    }

    const validation = llmParser.validateFilter(filter);
    const explanation = llmParser.explainFilter(filter);

    res.json({
      success: true,
      validation,
      explanation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/screener/metadata
 * Get available fields and operators
 */
router.get('/metadata', (req, res) => {
  try {
    const metadata = screenerRunner.getMetadata();
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/screener/breakdown
 * Get sector/industry breakdown
 */
router.post('/breakdown', async (req, res) => {
  try {
    const { filter, groupBy } = req.body;

    const result = await screenerRunner.getBreakdown(
      filter || { conditions: [] },
      groupBy || 'sector'
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/screener/compare
 * Compare specific stocks
 */
router.post('/compare', async (req, res) => {
  try {
    const { tickers } = req.body;

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tickers array is required',
      });
    }

    const result = await screenerRunner.compare(tickers);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/screener/aggregations
 * Get aggregated statistics
 */
router.post('/aggregations', async (req, res) => {
  try {
    const { filter, aggregations } = req.body;

    if (!Array.isArray(aggregations) || aggregations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aggregations array is required',
      });
    }

    const result = await screenerRunner.runAggregations(
      filter || { conditions: [] },
      aggregations
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/screener/save
 * Save a screen
 */
router.post(
  '/save',
  requireAuth,
  [
    body('name').notEmpty().trim(),
    body('filter').notEmpty(),
    body('description').optional().trim(),
    body('isPublic').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, filter, description, isPublic } = req.body;

      const result = await screenerRunner.saveScreen(
        req.user.userId,
        name,
        filter,
        { description, isPublic }
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/screener/saved
 * Get user's saved screens
 */
router.get('/saved', requireAuth, async (req, res) => {
  try {
    const includePublic = req.query.includePublic !== 'false';
    const result = await screenerRunner.getUserScreens(req.user.userId, includePublic);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/screener/saved/:id
 * Run a saved screen
 */
router.get('/saved/:id', optionalAuth, async (req, res) => {
  try {
    const screenId = parseInt(req.params.id);
    const options = {
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0,
    };

    const userId = req.user?.userId || null;
    const result = await screenerRunner.runSavedScreen(screenId, userId, options);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/v1/screener/saved/:id
 * Delete a saved screen
 */
router.delete('/saved/:id', requireAuth, async (req, res) => {
  try {
    const screenId = parseInt(req.params.id);
    const result = await screenerRunner.deleteScreen(screenId, req.user.userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/screener/suggest
 * Get query suggestions
 */
router.get(
  '/suggest',
  [query('q').optional()],
  async (req, res) => {
    try {
      const partialQuery = req.query.q || '';
      const result = await llmParser.suggestFilters(partialQuery);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;