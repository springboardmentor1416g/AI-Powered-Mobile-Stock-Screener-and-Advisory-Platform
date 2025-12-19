const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function runScreener(dslPayload) {
  // Placeholder for future backend integration
  console.log('Calling screener API with:', dslPayload);

  return {
    success: true,
    data: [
      { symbol: 'TCS', name: 'Tata Consultancy Services' },
      { symbol: 'INFY', name: 'Infosys Ltd' }
    ]
  };
}
