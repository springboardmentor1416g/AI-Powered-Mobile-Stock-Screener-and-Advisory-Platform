import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  return res.json({
    message: "Watchlist accessed",
    user: req.user
  });
});

export default router;
