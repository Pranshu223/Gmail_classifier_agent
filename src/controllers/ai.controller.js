import { EMAIL_SAMPLES } from "../constants/emailSamples.js";
import { generateWithGroq } from "../services/groq.service.js";
import { buildPrompt } from "../helpers/promptBuilder.js";

export async function testLLM(req, res) {
  const email = EMAIL_SAMPLES.find(e => e.id === req.params.id);

  if (!email) {
    return res.status(404).json({ error: "Email not found" });
  }

  const prompt = buildPrompt(email);
  const result = await generateWithGroq(prompt);

  res.json({
    email,
    llmResult: result
  });
}
