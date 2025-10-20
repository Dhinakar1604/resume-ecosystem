import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/ai-improve", async (req, res) => {
  const { text, summaryType } = req.body; 

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Text is required" });
  }


const basePrompt = `
Analyze the following existing summary. Your task is to generate a new, enhanced, and perfect summary that is clearer, more comprehensive, and structurally superior.

Goal: Create a highly polished, professional, and detailed summary that retains all essential information while significantly improving clarity, flow, and impact.

Specific Requirements for the New Summary:
1. Clarity and Conciseness: Rephrase any ambiguous or convoluted sentences.
2. Completeness and Detail: Make points explicit and detailed.
3. Structure and Flow: Organize the summary logically.
4. Tone: Maintain a professional, authoritative, and objective tone.
5. Contextual Tone: Tailor the tone and emphasis for a ${summaryType || 'general professional'} context.
6. CRITICAL OUTPUT RULE: ONLY return the final, improved summary text. **Do not include any formatting symbols such as *, **, _, #, or markdown. Only plain text. Start directly with the summary content.**

Original Summary to Enhance:
---
${text}
---
`;


  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o", 
        messages: [
          {
            role: "user",
            content: basePrompt 
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const improvedText =
      response.data?.choices?.[0]?.message?.content?.trim() || "Error generating summary.";

    res.json({ result: improvedText });
  } catch (error) {
    console.error("AI request failed:", error.response?.data || error.message);
    res.status(500).json({ message: "AI request failed", error: error.message });
  }
});

export default router;