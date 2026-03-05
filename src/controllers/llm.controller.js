import {
    summarizeEmails,
    streamSummary,
    generateReply
  } from "../services/llm.services.js";
  
//SUMMARIZE
  
  export const summarizeController = async (req, res) => {
    try {
      const { emails, stream } = req.body;
  
      if (!emails || !Array.isArray(emails)) {
        return res.status(400).json({
          success: false,
          message: "emails must be an array"
        });
      }
  
      // Streaming mode
      if (stream) {
        res.setHeader("Content-Type", "text/plain");
        return streamSummary(emails[0], res);
      }
  
      const result = await summarizeEmails(emails);
  
      res.json({
        success: true,
        data: result
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  
 ///REPLY

  export const replyController = async (req, res) => {
    try {
      const { email, tone } = req.body;
  
      if (!email || !tone) {
        return res.status(400).json({
          success: false,
          message: "email and tone are required"
        });
      }
  
      const reply = await generateReply(email, tone);
  
      res.json({
        success: true,
        data: reply
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };