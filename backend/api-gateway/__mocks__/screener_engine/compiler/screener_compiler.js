// Manual mock for screener_compiler to prevent dependency resolution issues in CI
module.exports = jest.fn().mockReturnValue({});
