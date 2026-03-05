import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
dotenv.config();
export const model = new ChatGroq({
    apiKey: process.env.GEMINI_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0.3
});

//summarization prompt
const summaryPrompt = new PromptTemplate({
    template:
    `You are an intelligent email assistant. Summarize the email clearly in 3 bulleted points . Highlight urgency if any.
    Email: {email}`,
    inputVariables: ["email"],
});

//batch summarization
export const summarizeEmails = async(emails)=>{
    const summaries = await Promise.all(
        emails.map(async(email)=>{
            const formatted = await summaryPrompt.format({email});
            const response = await model.invoke(formatted);
            return response.content;
        })
    );
    return summaries;
}

//Streaming summary
export const streamSummary = async(email,res)=>{
    const formatted = await summaryPrompt.format({email});
    const stream = await model.stream(formatted);
    for await(const chunk of stream){
        res.write(chunk.content);
    }
    res.end();
};

//Structured reply by zod
const replySchema = z.object({
    subject: z.string(),
    body: z.string(),
    tone: z.string(),
    confidence: z.number(),  
});
const parser = StructuredOutputParser.fromZodSchema(replySchema);
const replyPrompt = new PromptTemplate({template:
    `You are an AI email assistant.

Write a reply in {tone} tone.
Return ONLY valid JSON in this format:
{format_instructions}
Original Email:
{email}`,
inputVariables: ["email","tone","format_instructions"],
});

//generate structured reply
export const generateReply = async (email, tone) => {
    const formatInstructions = parser.getFormatInstructions();
  
    const formatted = await replyPrompt.format({
      email,
      tone,
      format_instructions: formatInstructions,
    });
  
    const response = await model.invoke(formatted);
  
    try {
      // Remove markdown fences
      const cleaned = response.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
  
      // Extract last JSON object from text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}$/);
  
      if (!jsonMatch) {
        throw new Error("No valid JSON found");
      }
  
      const parsed = JSON.parse(jsonMatch[0]);
  
      return parsed;
  
    } catch (error) {
      return {
        subject: "Re: Your Email",
        body: response.content,
        tone,
        confidence: 0.5,
      };
    }
  };