// Manual mock for screener_runner to prevent dependency resolution issues in CI
module.exports = {
  run: jest.fn().mockResolvedValue([])
};
