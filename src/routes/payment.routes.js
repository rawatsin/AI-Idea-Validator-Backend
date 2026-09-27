import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  verifyPayment,
  failPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/verify", authMiddleware, verifyPayment);
router.post("/failed", authMiddleware, failPayment);

export default router;
