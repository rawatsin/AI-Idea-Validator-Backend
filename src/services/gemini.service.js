import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generatePostSummary = async (title, content) => {
  const prompt = `
You are an AI assistant for a Reddit-like discussion platform.

Analyze the following post and return ONLY valid JSON.

Post Title:
${title}

Post Content:
${content}

Return this exact JSON structure:

{
  "summary": "A concise 2-4 sentence summary.",
  "keyPoints": [
    "Point 1",
    "Point 2",
    "Point 3"
  ],
  "category": "Technology",
  "sentiment": "Positive",
  "readingTime": "2 min",
  "tags": ["AI", "LLM", "Discussion"],
  "controversyScore": 5,
  "discussionPotential": "High"
}

Rules:
- Return ONLY JSON.
- Do not use markdown.
- Do not wrap the JSON in \`\`\`.
- Do not invent facts.
- If information is missing, base the summary only on the given content.
- controversyScore must be an integer between 1 and 10.
- discussionPotential must be one of: Low, Medium, High.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Raw Gemini Response:\n", text);
      throw err;
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate AI summary.");
  }
};
