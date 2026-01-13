import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const fetchCompanyDetail = (ticker: string) =>
  axios.get(`${API}/companies/${ticker}`);

export const fetchCompanyFundamentals = (ticker: string) =>
  axios.get(`${API}/companies/${ticker}/fundamentals`);

export const fetchCompanyPriceHistory = (ticker: string) =>
  axios.get(`${API}/companies/${ticker}/prices`);
