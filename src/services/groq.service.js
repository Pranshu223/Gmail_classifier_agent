import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateWithGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return completion.choices[0].message.content;
}
