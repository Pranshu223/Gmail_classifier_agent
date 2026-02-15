import { EMAIL_SAMPLES } from "../constants/emailSamples.js";
import { classifyEmail } from "../services/classifier.service.js";

export const testEmails = async (req, res) => {
  const results = [];

  for (const email of EMAIL_SAMPLES) {
    const classification = await classifyEmail(email);

    results.push({
      id: email.id,
      subject: email.subject,
      predictedCategory: classification.predicted_label,
      confidence: classification.confidence
    });
  }

  res.json(results);
};