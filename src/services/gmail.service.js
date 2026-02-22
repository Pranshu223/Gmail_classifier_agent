import { google } from "googleapis";
import { spawn } from "child_process";
import { htmlToText } from "html-to-text";


// 🔹 Extract clean text body from Gmail payload
const extractBody = (payload) => {
  if (!payload) return "";

  // Case 1: Simple email
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  // Case 2: Multipart email (newsletter, etc.)
  if (payload.parts) {
    for (let part of payload.parts) {
      // Prefer plain text
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }

      // If only HTML available
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = Buffer.from(part.body.data, "base64").toString("utf-8");
        return htmlToText(html, { wordwrap: false });
      }
    }
  }

  return "";
};



export const fetchAndClassify = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });

  // 🔹 Fetch messages list (you can increase maxResults safely now)
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 150
  });

  if (!response.data.messages) return [];

  const messages = response.data.messages;
  const emails = [];

  for (let msg of messages) {
    try {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id
      });

      const payload = full.data.payload || {};
      const headers = payload.headers || [];

      const subject = String(
        headers.find(h => h.name === "Subject")?.value || ""
      );

      const from = String(
        headers.find(h => h.name === "From")?.value || ""
      );

      const rawBody = extractBody(payload);

      // 🔹 Limit body size to prevent model overload
      const body = rawBody.slice(0, 2000);

      emails.push({
        id: msg.id,
        from,
        subject,
        body
      });

    } catch (err) {
      console.log("Skipping malformed email:", msg.id);
      continue;
    }
  }

  // 🔹 Filter invalid emails before sending to Python
  const cleanEmails = emails.filter(e =>
    typeof e.id === "string" &&
    typeof e.from === "string" &&
    typeof e.subject === "string" &&
    typeof e.body === "string"
  );

  // 🔹 Call Python classifier
  return new Promise((resolve, reject) => {
    const python = spawn("python", ["test_embeddings.py"]);

    python.stdin.write(JSON.stringify(cleanEmails));
    python.stdin.end();

    let data = "";
    let errorData = "";

    python.stdout.on("data", chunk => {
      data += chunk.toString();
    });

    python.stderr.on("data", chunk => {
      errorData += chunk.toString();
    });

    python.on("close", (code) => {
      if (errorData) {
        console.error("PYTHON STDERR:", errorData);
      }

      if (!data) {
        return reject(new Error("Python returned empty output"));
      }

      try {
        const jsonStart = data.indexOf("[");
        const jsonEnd = data.lastIndexOf("]") + 1;
        
        if (jsonStart === -1 || jsonEnd === -1) {
          return reject(new Error("Invalid JSON structure from Python"));
        }
        
        const cleanJson = data.slice(jsonStart, jsonEnd);
        
        resolve(JSON.parse(cleanJson));
      } catch (err) {
        console.log(err);
        reject(new Error("Invalid JSON from Python"));
      }
    });

    python.on("error", reject);
  });
};