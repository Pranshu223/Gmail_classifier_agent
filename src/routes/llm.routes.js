import express from "express";
import {
  summarizeController,
  replyController
} from "../controllers/llm.controller.js";

const router = express.Router();

router.post("/summarize", summarizeController);
router.post("/reply", replyController);

export default router;