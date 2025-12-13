import express from "express";
import { getStockMetadata } from "../controllers/metadataController.js";

const router = express.Router();
router.get("/stocks", getStockMetadata);

export default router;
