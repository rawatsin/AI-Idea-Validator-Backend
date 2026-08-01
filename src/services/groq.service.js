import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const analyzeIdeaStartUp = async (idea) => {
  const prompt = `
You are an expert startup consultant.

Analyze the following startup idea and return ONLY valid JSON.

Return this structure:

{
  "summary": "",
  "marketOpportunity": "",
  "strengths": [],
  "weaknesses": [],
  "risks": [],
  "competitors": [],
  "recommendations": [],
  "confidence": 0
}

Startup Idea:
${JSON.stringify(idea, null, 2)}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      response_format: {
        type: "json_object",
      },
    });

    const content = completion.choices[0].message.content;

    return JSON.parse(content);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to analyze startup idea.");
  }
};