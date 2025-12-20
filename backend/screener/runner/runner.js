const fs = require("fs");
const path = require("path");
const { compileScreener } = require("../compiler/compiler");

const DATA_PATH = path.join(
  __dirname,
  "../../../storage/processed/fundamentals/fundamentals_annual.csv"
);

function loadData() {
  const rows = fs.readFileSync(DATA_PATH, "utf-8").split("\n");
  const headers = rows[0].split(",");
  return rows.slice(1).map(r => {
    const obj = {};
    r.split(",").forEach((v, i) => (obj[headers[i]] = Number(v) || v));
    return obj;
  });
}

async function runScreener(rules) {
  const data = loadData();
  const predicate = compileScreener(rules);
  return data.filter(predicate);
}

module.exports = { runScreener };
