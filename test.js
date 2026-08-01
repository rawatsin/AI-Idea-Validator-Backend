import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const res = await groq.chat.completions.create({
  model: process.env.GROQ_MODEL,
  messages: [
    {
      role: "user",
      content: "Say hello in JSON",
    },
  ],
  response_format: {
    type: "json_object",
  },
});

console.log(res.choices[0].message.content);