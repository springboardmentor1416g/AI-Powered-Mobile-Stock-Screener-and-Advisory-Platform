module.exports = {
  compileAndRun: jest.fn(async () => ({
    success: true,
    results: [
      { symbol: 'TCS', name: 'Tata Consultancy Services', pe_ratio: 18.2 },
      { symbol: 'INFY', name: 'Infosys Ltd', pe_ratio: 21.5 }
    ]
  }))
};
