import express from "express";
import { getprivate, getTest } from "../controllers/test.controller.js";

const router = express.Router();

router.get("/get",getTest);
router.get("/private/get",getprivate)

export default router;