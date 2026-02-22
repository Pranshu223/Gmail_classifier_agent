import "dotenv/config";
import app from "./app.js";

const PORT = 5000;
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
