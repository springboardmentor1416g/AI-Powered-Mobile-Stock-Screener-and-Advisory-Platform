import { getMockStocks } from "../services/stocksService.js";

export const getStockMetadata = (req, res) => {
  const data = getMockStocks();
  return res.json(data);
};
