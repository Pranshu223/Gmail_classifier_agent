import express from "express";
import { testLLM } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/test/:id", testLLM);

export default router;
