import axios from "axios";

const API_URL = "https://api.example.com/stocks";

export const getStocks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
