const { exec } = require("child_process");

module.exports.callLLM = (prompt) =>
  new Promise((resolve, reject) => {
    exec(
      `ollama run llama3.1:8b "${prompt.replace(/"/g, '\\"')}"`,
      { maxBuffer: 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout.trim());
      }
    );
  });