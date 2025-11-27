// Backend/services/textProcessor.js
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

// A robust prompt that asks the LLM to return strict JSON
const buildPrompt = (title, description, durationSeconds = 3) => {
  return `
You are an assistant that generates a structured animation script for 3D rendering.
Input:
  - title: "${title}"
  - description: "${description}"
  - target_total_duration_seconds: ${durationSeconds}

Return ONLY a JSON object with this exact schema:
{
  "title": string,
  "duration": number,           // total duration seconds
  "scenes": [
    {
      "id": string,
      "duration": number,       // seconds
      "narration": string,
      "camera": {
        "type": "orbit"|"static"|"pan",
        "keyframes": [
          { "t": 0.0, "position": [x,y,z], "lookAt": [x,y,z] }
        ]
      },
      "objects": [
        {
          "id": string,
          "type": "sphere"|"box"|"plane"|"custom",
          "params": { /* size, radius, color hex, texture, etc. */ },
          "keyframes": [
            { "t": 0.0, "position": [x,y,z], "rotation": [x,y,z], "scale": [x,y,z] }
          ],
          "physics": { "velocity": [x,y,z], "onCollision": "bounce"|"stop" }
        }
      ],
      "events": [ /* optional timeline events */ ]
    }
  ]
}
Be concise. Validate numbers. Use simple floats and arrays.
`;
};

async function generateScript(title, description, targetDuration = 3) {
  const prompt = buildPrompt(title, description, targetDuration);

  // Example generic POST — adapt headers/format to Gemini/PaLM SDK
  const payload = {
    prompt,
    // Depending on the API you may set model, max_tokens, temperature, etc.
    model: "gpt-like-or-gemini-model",
    max_tokens: 800,
    temperature: 0.2,
    stop: null
  };

  try {
    const res = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Map depending on your LLM's response shape:
    // If response text is in res.data.output_text or similar, adjust accordingly.
    const text = res.data?.output_text ?? res.data?.choices?.[0]?.text ?? JSON.stringify(res.data);

    // Parse JSON — the prompt forces strict JSON
    const script = JSON.parse(text);
    return script;
  } catch (err) {
    console.error('textProcessor.generateScript error:', err?.response?.data || err.message);
    throw new Error('LLM generation failed: ' + (err.message || 'unknown'));
  }
}

module.exports = {
  generateScript,
};
