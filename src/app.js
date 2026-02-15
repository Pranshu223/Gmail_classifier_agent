import express from "express";
import aiRoutes from "./routes/ai.routes.js";
import testRoutes from "./routes/test.routes.js";
const app = express();

app.use(express.json());
app.use("/api/v1/ai",aiRoutes);
app.use("/api/v1/test",testRoutes);

export default app;