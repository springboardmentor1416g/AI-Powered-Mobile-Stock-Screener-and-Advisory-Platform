const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callLLM(prompt) {
  // Check if fetch is available (Node 18+). If not, you might need: const fetch = require('node-fetch');
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:4000",
      "X-Title": "Stock Screener"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini", // Or your preferred model
      messages: [
        {
          role: "system",
          content: "You are a stock screener assistant. Output ONLY valid JSON DSL. No markdown, no explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Error: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Cleanup potential markdown formatting if the LLM adds it (e.g. ```json ... ```)
  return content.replace(/```json/g, '').replace(/```/g, '').trim();
}

module.exports = { callLLM };