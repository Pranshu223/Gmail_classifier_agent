import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY,
  {
     apiVersion: "v1"
  }
);
console.log("API key called",genAI);
export const geminiModel = genAI.getGenerativeModel({
  model: "llama-3.1-8b-instant"
});
console.log("geminiMODEL",geminiModel);