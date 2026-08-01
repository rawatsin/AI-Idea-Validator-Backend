import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    marketOpportunity: { type: Type.STRING },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    competitors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    confidence: {
      type: Type.INTEGER,
    },
  },
  required: [
    "summary",
    "marketOpportunity",
    "strengths",
    "weaknesses",
    "risks",
    "competitors",
    "recommendations",
    "confidence",
  ],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyzeStartupIdea = async (idea) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an experienced startup advisor.

Analyze the startup idea realistically.

Return objective, actionable feedback.

Title: ${idea.title}

Pitch:
${idea.pitch}

Problem:
${idea.problem}

Solution:
${idea.solution}

Target Audience:
${idea.targetAudience}

Business Type:
${idea.businessType}

Geography:
${idea.geography}

Stage:
${idea.stage}

Revenue Model:
${idea.revenueModel || "Not provided"}

Competitors:
${idea.competitors || "Not provided"}

Assumption:
${idea.assumption || "Not provided"}

Additional Context:
${idea.additionalContext || "None"}
`;

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error(`Gemini attempt ${attempt} failed`);

      if (
        error.status === 503 &&
        attempt < MAX_RETRIES
      ) {
        await sleep(1000 * Math.pow(2, attempt - 1));
        continue;
      }

      throw error;
    }
  }
};