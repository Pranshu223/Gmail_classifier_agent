import { google } from "googleapis";
import { spawn } from "child_process";
import path from "path";

export const fetchAndClassify = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10
  });

  const messages = response.data.messages || [];

  const emails = [];

  for (let msg of messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id
    });

    const headers = full.data.payload.headers || [];

    const subject = headers.find(h => h.name === "Subject")?.value || "";
    const from = headers.find(h => h.name === "From")?.value || "";

    emails.push({
      id: msg.id,
      from,
      subject,
      body: ""
    });
  }

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "test_embeddings.py");

    const python = spawn("python", [scriptPath]);

    let stdoutData = "";
    let stderrData = "";

    python.stdout.on("data", chunk => {
      stdoutData += chunk.toString();
    });

    python.stderr.on("data", chunk => {
      stderrData += chunk.toString();
    });

    python.on("close", code => {
      if (stderrData) {
        console.error("PYTHON STDERR:", stderrData);
      }

      if (!stdoutData.trim()) {
        return reject("Python returned empty output");
      }

      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        console.error("RAW PYTHON OUTPUT:", stdoutData);
        reject("Failed to parse Python output");
      }
    });

    python.on("error", err => {
      reject("Failed to start Python process: " + err.message);
    });

    python.stdin.write(JSON.stringify(emails));
    python.stdin.end();
  });
};