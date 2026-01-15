class Pool {
  constructor() {}
  query() {
    return Promise.resolve({ rows: [] });
  }
  end() {}
}

module.exports = { Pool };
