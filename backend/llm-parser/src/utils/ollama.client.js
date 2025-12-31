const axios = require("axios");

async function callOllama(prompt) {
  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3.2:3b",
    prompt,
    stream: false
  });

  // Ollama returns text → parse JSON strictly
  return JSON.parse(res.data.response);
}

module.exports = { callOllama };
