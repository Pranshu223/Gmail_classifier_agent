//only work of this file is Take an email (JS object) → send it to Python → get classification → return result
//its just a bridge between ... nodeJS <-> python
import { spawn } from "child_process";
import path from "path";

const pythonPath = "ml-env\\Scripts\\python.exe";
const scriptPath = path.join(process.cwd(), "test_embeddings.py");

export const classifyEmailsBatch = (emails) => {
  return new Promise((resolve, reject) => {
    const py = spawn(pythonPath, [scriptPath]); //python process starts -> test_bart.py loads model and python waits for input via STDIN

    let output = "";
    let error = "";

    // Read Python output
    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Read Python errors
    py.stderr.on("data", (data) => {
      console.warn("PYTHON STDERR:", data.toString());
    });

    //python process ends , python finishes execution and script ends
    py.on("close", () => {
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject("Failed to parse Python output: " + output);
      }
    });

    py.stdin.write(JSON.stringify(emails));
    py.stdin.end();
  });
};