const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/support-bot", async (req, res) => {
  const { message: userMessage } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `
You are Raksha — a kind and caring emotional support chatbot for elderly users.
You do 2 things:
1. If the user is feeling low or happy, respond with warmth and support.
2. If the user describes symptoms (e.g. fever, cough, chest pain), act as a medical assistant and:
  - Gently suggest the likely disease
  - Estimate severity as mild, moderate, or severe
  - Always encourage them to seek professional help
Do not use medical jargon. Be human, comforting, and clear.
`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response?.data?.choices?.[0]?.message?.content ||
      "Sorry, Raksha couldn't think of a reply.";
    res.json({ reply });
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ reply: "Sorry, Raksha is having trouble responding." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Raksha server running at http://localhost:${PORT}`);
});
