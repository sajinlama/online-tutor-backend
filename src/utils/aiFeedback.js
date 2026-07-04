import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateAIFeedback = async (progressData, subject) => {
  try {
    // Ensure progressData is an array
    const progress = Array.isArray(progressData) ? progressData : [progressData];

    // Identify weak chapters (below 50%)
    const weakChapters = progress
      .filter(item => item.percentage < 50)
      .map(item => item.chapterName);

    const allChapters = progress.map(item => item.chapterName);

    const promptData = {
      subject,
      chapterData: progress.map(item => ({
        name: item.chapterName || "Unknown Chapter",
        correctAnswers: item.correctAnswers || 0,
        wrongAnswers: item.wrongAnswers || 0,
        percentage: item.percentage || 0,
        level: item.level || "Unknown Level"
      })),
      weakChapters,
      allChapters
    };

    const prompt = `
You are an expert educational analyst and tutor. Given student performance data, you will produce structured feedback in valid JSON only (no extra text outside the JSON object). The JSON must exactly follow this schema:

{
  "overallPerformance": "string — a 2–3 sentence summary of the student’s performance",
  "weakChapters": ["array of chapter names where the student scored below 50%"],
  "chaptersToFocusOn": ["array of chapters the student should focus on next"],
  "personalizedSuggestions": [
    "string — suggestion 1",
    "string — suggestion 2",
    "string — suggestion 3",
    "string — suggestion 4",
    "string — suggestion 5"
  ]
}

Subject: ${subject}

Performance array:
${JSON.stringify(promptData.chapterData, null, 2)}

Chapters where performance < 50%:
${JSON.stringify(weakChapters, null, 2)}

All attempted chapters:
${JSON.stringify(allChapters, null, 2)}

Rules:
1. Focus on weak chapters first.
2. If no weak chapters, suggest improvement tasks based on the highest errors.
3. Provide exactly 5 suggestions, numbered, tailored to this student’s performance trends.
4. Do NOT include any text outside of the required JSON.
`;

    // ✅ Call the new SDK correctly
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt
    });

    const text = result.text;

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Ensure weak chapters are mentioned
    if (weakChapters.length > 0 && !parsedResponse.overallPerformance.toLowerCase().includes("weak")) {
      parsedResponse.overallPerformance += ` You should focus on improving in ${weakChapters.join(", ")} as these are areas where you're facing difficulties.`;
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating AI feedback:", error);

    // Fallback response
    const weakChapters = Array.isArray(progressData)
      ? progressData.filter(item => (item.percentage || 0) < 50).map(item => item.chapterName || "Unknown Chapter")
      : [];

    return {
      overallPerformance: weakChapters.length > 0
        ? `We're analyzing your performance. You need to focus on improving in ${weakChapters.join(", ")} as you showed difficulty in these areas.`
        : "We're analyzing your performance. Review your incorrect answers to improve your understanding.",
      chaptersToFocusOn: weakChapters.length > 0 ? weakChapters : (progressData.chapterName ? [progressData.chapterName] : []),
      personalizedSuggestions: [
        "Review concepts in your weak chapters",
        "Practice similar problems",
        "Ask for help on difficult concepts",
        "Use additional resources to strengthen your understanding",
        "Take short quizzes to check understanding"
      ]
    };
  }
};
