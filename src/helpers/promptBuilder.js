export function buildPrompt(email) {
  return `
You are an AI assistant that summarizes emails.

Generate a short, clear summary (2–3 sentences max) for the following email.
Focus on:
- main intent
- important details
- required action (if any)

Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Return ONLY valid JSON in this exact format:
{
  "summary": "your summary text here"
}
`;
}
