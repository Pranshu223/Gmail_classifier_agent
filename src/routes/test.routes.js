import express from "express";
import { generateWithGroq } from "../services/groq.service.js";
import { classifyEmailsBatch } from "../services/classifier.service.js";
import { EMAIL_SAMPLES } from "../constants/emailSamples.js";

const router = express.Router();

router.get("/llm-test", async (req, res) => {
  try {
    const result = await generateWithGroq(
      "Say 'Groq LLM is working' in one short sentence."
    );

    res.json({
      success: true,
      response: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get("/emails", async (req, res) => {
  try {
    const results = await classifyEmailsBatch(EMAIL_SAMPLES);

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err
    });
  }
});

export default router;
