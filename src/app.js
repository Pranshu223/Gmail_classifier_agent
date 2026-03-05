import express from "express";
import aiRoutes from "./routes/ai.routes.js";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js"
import gmailRoutes from "./routes/gmail.routes.js";
import llmRoutes from "./routes/llm.routes.js"
const app = express();

app.use(express.json());
app.use("/api/v1/ai",aiRoutes);
app.use("/api/v1/test",testRoutes);
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/gmail",gmailRoutes);
app.use("/api/v1/llm",llmRoutes);

export default app;