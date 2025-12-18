import express from "express";
import { getStocks } from "../controllers/metadata.controller.js";

const router = express.Router();

router.get("/metadata/stocks", getStocks);

export default router;
