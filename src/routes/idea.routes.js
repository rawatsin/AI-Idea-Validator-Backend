import express from "express";
import { analyzeIdea, getIdeaById, getIdeas } from "../controllers/idea.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/analyze", authMiddleware, analyzeIdea);
router.get("/:id", authMiddleware, getIdeaById);
router.get("/", authMiddleware, getIdeas);
// router.patch("/:id",updateIdea);
// router.delete("/:id", deleteIdea);

export default router;