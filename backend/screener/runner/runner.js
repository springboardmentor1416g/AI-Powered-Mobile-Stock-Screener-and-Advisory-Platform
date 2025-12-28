const pool = require("../../config/db");

async function runScreener(compiledQuery) {
  try {
    console.log("SQL:", compiledQuery.text);
    console.log("Params:", compiledQuery.values);
    
    // Execute query
    const res = await pool.query(compiledQuery.text, compiledQuery.values);
    return res.rows; // Return the actual data array
  } catch (err) {
    console.error("DB Error:", err);
    throw new Error(err.message);
  }
}

module.exports = { runScreener };