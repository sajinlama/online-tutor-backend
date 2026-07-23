import { 
   getAIFeedbackFromMicroservice,
  getQuestionMap,
  gradeAnswers,
  buildProgressArray,
  updateMathsScore,
  updateUserProgress,
} from "../../service/maths.service.js";



const checkAnsMaths = async (req, res) => {
  try {
    const { userId, chapterName, answers, level } = req.body;

    if (!Array.isArray(answers) || !chapterName || !userId) {
      return res.status(400).json({
        error:
          "Invalid request format. Answers must be an array, and userId and chapterName are required.",
      });
    }

    // 1. Extract question IDs from frontend answers
    const questionIds = answers.map((ans) => ans.questionId);

    // 2. Fetch correct answers + build lookup map
    const questionMap = await getQuestionMap(questionIds);

    // 3. Compare user answers against correct database answers
    const { correctAnswers, wrongAnswers, percentage, chapterResults, incorrectChapters } =
      gradeAnswers(answers, questionMap);

    // 4. Format chapter progress
    const progressArray = buildProgressArray(chapterResults, incorrectChapters, level);

    // Identify problem areas
    const allChapters = progressArray.map((item) => item.chapterName);
    const weakChapters = progressArray
      .filter((item) => item.percentage < 50)
      .map((item) => item.chapterName);
    const chaptersWithErrors = Array.from(incorrectChapters);

    // 5. Call external Python FastAPI AI Service
    const feedbackData = await getAIFeedbackFromMicroservice(progressArray, "maths");

    // 6. Update MathsScore Document
    await updateMathsScore({
      userId,
      correctAnswers,
      progressArray,
      feedbackData,
      weakChapters,
      chaptersWithErrors,
      incorrectChapters,
      level,
    });

    // 7. Update UserProgress Document (non-blocking on failure)
    try {
      await updateUserProgress(userId, correctAnswers);
    } catch (progressError) {
      console.error("Error updating UserProgress:", progressError.message);
    }

    // 8. Send structured response back to client
    return res.status(200).json({
      correctAnswers,
      wrongAnswers,
      percentage,
      totalScore: correctAnswers,
      feedback: {
        ...feedbackData,
        weakChapters,
        chaptersWithErrors,
        allChapters,
      },
    });
  } catch (error) {
    console.error("Error checking maths answers:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

export default checkAnsMaths;