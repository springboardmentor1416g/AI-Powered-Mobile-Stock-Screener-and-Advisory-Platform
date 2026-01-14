const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Fetch quarterly fundamentals for a company
 */
async function getQuarterlyFundamentals(ticker) {
  try {
    const query = `
      SELECT 
        period_start,
        period_end,
        quarter,
        revenue,
        gross_profit,
        operating_income,
        net_income,
        eps,
        ebitda,
        operating_margin,
        roe,
        roa,
        pe_ratio,
        pb_ratio
      FROM fundamentals_quarterly
      WHERE ticker = $1
      ORDER BY period_end DESC
      LIMIT 8
    `;
    
    const result = await pool.query(query, [ticker]);
    return result.rows;
  } catch (error) {
    console.error(`Error querying fundamentals for ${ticker}:`, error.message);
    // Return empty array if query fails (caller will handle fallback)
    return [];
  }
}

/**
 * Calculate TTM (Trailing Twelve Month) metrics from quarterly data
 */
function calculateTTM(quarterlyData) {
  if (!quarterlyData || quarterlyData.length === 0) {
    return null;
  }

  // Take last 4 quarters
  const last4Quarters = quarterlyData.slice(0, 4);
  
  const ttm = {
    revenue: 0,
    eps: 0,
    ebitda: 0,
    net_income: 0,
    free_cash_flow: 0, // Will be null if not available
    debt: null
  };

  last4Quarters.forEach(q => {
    ttm.revenue += Number(q.revenue) || 0;
    ttm.eps += Number(q.eps) || 0;
    ttm.ebitda += Number(q.ebitda) || 0;
    ttm.net_income += Number(q.net_income) || 0;
  });

  // Calculate derived ratios
  const latestQuarter = quarterlyData[0];
  const peRatio = latestQuarter?.pe_ratio || null;
  
  // Calculate PEG (if we have EPS growth)
  let pegRatio = null;
  if (quarterlyData.length >= 2 && quarterlyData[0].eps && quarterlyData[1].eps) {
    const epsGrowth = ((quarterlyData[0].eps - quarterlyData[1].eps) / quarterlyData[1].eps) * 100;
    if (epsGrowth > 0 && peRatio) {
      pegRatio = peRatio / epsGrowth;
    }
  }

  return {
    ...ttm,
    pe_ratio: peRatio,
    peg_ratio: pegRatio,
    debt_to_fcf: null // Would need debt and FCF data
  };
}

/**
 * Calculate growth trends (QoQ and YoY)
 */
function calculateTrends(quarterlyData) {
  if (!quarterlyData || quarterlyData.length < 2) {
    return {
      revenue_qoq: null,
      revenue_yoy: null,
      eps_qoq: null,
      eps_yoy: null,
      ebitda_qoq: null,
      ebitda_yoy: null
    };
  }

  const current = quarterlyData[0];
  const previous = quarterlyData[1];
  
  // Find same quarter from previous year (4 quarters ago)
  const yearAgo = quarterlyData.length >= 4 ? quarterlyData[3] : null;

  const calculateGrowth = (current, previous) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  return {
    revenue_qoq: calculateGrowth(current.revenue, previous.revenue),
    revenue_yoy: yearAgo ? calculateGrowth(current.revenue, yearAgo.revenue) : null,
    eps_qoq: calculateGrowth(current.eps, previous.eps),
    eps_yoy: yearAgo ? calculateGrowth(current.eps, yearAgo.eps) : null,
    ebitda_qoq: calculateGrowth(current.ebitda, previous.ebitda),
    ebitda_yoy: yearAgo ? calculateGrowth(current.ebitda, yearAgo.ebitda) : null
  };
}

/**
 * Get company fundamentals with TTM and trends
 */
async function getCompanyFundamentals(ticker) {
  try {
    const quarterly = await getQuarterlyFundamentals(ticker);
    
    if (quarterly.length === 0) {
      return {
        quarterly: [],
        ttm: null,
        trends: null
      };
    }

    const ttm = calculateTTM(quarterly);
    const trends = calculateTrends(quarterly);

    return {
      quarterly,
      ttm,
      trends
    };
  } catch (error) {
    console.error('Error fetching company fundamentals:', error);
    // Return empty structure instead of throwing
    // Route handler will provide fallback mock data
    return {
      quarterly: [],
      ttm: null,
      trends: null
    };
  }
}

module.exports = {
  getCompanyFundamentals,
  getQuarterlyFundamentals,
  calculateTTM,
  calculateTrends
};
