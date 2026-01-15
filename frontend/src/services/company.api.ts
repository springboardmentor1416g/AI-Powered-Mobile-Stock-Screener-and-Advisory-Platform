// src/services/company.api.ts

export async function fetchCompanyDetail(ticker: string) {
  try {
    const response = await fetch(`/api/company/${ticker}`);

    if (!response.ok) {
      throw new Error("Failed to fetch company details");
    }

    return await response.json();
  } catch (error) {
    console.error("Company API error:", error);
    throw error;
  }
}
