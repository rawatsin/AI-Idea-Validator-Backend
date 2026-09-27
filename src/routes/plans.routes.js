import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { postPlan } from "../controllers/plans.controller.js";

const router = express.Router();

// router.get("/getAllPlans",getAllPlans);
router.post("/",authMiddleware,postPlan);

export default router;
