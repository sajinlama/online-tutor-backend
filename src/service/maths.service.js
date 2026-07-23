import axios from "axios";
import Maths from "../models/maths/mathsQuestion.models.js";
import UserProgress from "../models/users/userProgress.models.js";
import MathsScore from "../models/maths/mathScore.models.js"

// Read AI service URL from environment, defaulting to localhost in development
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Sends progress data to the Python FastAPI microservice to generate
 * AI feedback. Has a built-in timeout and graceful fallback so quiz
 * processing never breaks even if the AI service is down.
 */
export const getAIFeedbackFromMicroservice = async (progressArray, subject) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/generate-feedback`,
      { subject, progress: progressArray },
      { timeout: 15000 }
    );

    return response.data;
  } catch (error) {
    console.error("AI Microservice Error:", error.message);

    // Fallback response so user quiz processing never breaks
    return {
      summary:
        "Great effort on completing the quiz! Keep practicing weak chapters to sharpen your knowledge.",
      generatedAt: new Date(),
    };
  }
};

/**
 * Fetches the correct answers for the given question IDs and builds
 * a lookup map: questionId -> { rightAns, chapterName }
 */
export const getQuestionMap = async (questionIds) => {
  const questions = await Maths.find(
    { _id: { $in: questionIds } },
    "_id rightAns chapterName"
  );

  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = {
      rightAns: q.rightAns,
      chapterName: q.chapterName,
    };
  });

  return questionMap;
};

/**
 * Compares user answers against the correct answers and builds
 * per-chapter and overall results.
 */
export const gradeAnswers = (answers, questionMap) => {
  let correctAnswers = 0;
  let wrongAnswers = 0;

  const chapterResults = {};
  const incorrectChapters = new Set();

  answers.forEach((ans) => {
    const questionInfo = questionMap[ans.questionId];

    if (!questionInfo) {
      console.log(`Question ID ${ans.questionId} not found in database`);
      return;
    }

    const correct = questionInfo.rightAns;
    const chName = ans.chapterName || questionInfo.chapterName;

    if (!chapterResults[chName]) {
      chapterResults[chName] = { correctAnswers: 0, wrongAnswers: 0 };
    }

    if (correct === ans.selectedAnswer) {
      correctAnswers++;
      chapterResults[chName].correctAnswers++;
    } else {
      wrongAnswers++;
      chapterResults[chName].wrongAnswers++;
      incorrectChapters.add(chName);
    }
  });

  const totalAnswered = correctAnswers + wrongAnswers;
  const percentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

  return { correctAnswers, wrongAnswers, percentage, chapterResults, incorrectChapters };
};

/**
 * Formats raw chapter results into the progress array shape used
 * for both the API response and DB storage.
 */
export const buildProgressArray = (chapterResults, incorrectChapters, level) => {
  return Object.keys(chapterResults).map((ch) => {
    const chapterData = chapterResults[ch];
    const chapterTotal = chapterData.correctAnswers + chapterData.wrongAnswers;
    const chapterPercentage =
      chapterTotal > 0 ? (chapterData.correctAnswers / chapterTotal) * 100 : 0;

    return {
      chapterName: ch,
      correctAnswers: chapterData.correctAnswers,
      wrongAnswers: chapterData.wrongAnswers,
      percentage: chapterPercentage,
      level,
      hasIncorrectAnswers: incorrectChapters.has(ch),
    };
  });
};

/**
 * Creates or updates the MathsScore document for a user with the
 * latest progress and AI feedback.
 */
export const updateMathsScore = async ({
  userId,
  correctAnswers,
  progressArray,
  feedbackData,
  weakChapters,
  chaptersWithErrors,
  incorrectChapters,
  level,
}) => {
  let userScore = await MathsScore.findOne({ userId });

  const aiFeedbackPayload = {
    ...feedbackData,
    weakChapters,
    chaptersWithErrors,
  };

  if (!userScore) {
    userScore = new MathsScore({
      userId,
      totalScore: correctAnswers,
      progress: progressArray,
      aiFeedback: aiFeedbackPayload,
    });
  } else {
    userScore.totalScore = correctAnswers;

    progressArray.forEach((newProgress) => {
      const existingIndex = userScore.progress.findIndex(
        (p) => p.chapterName === newProgress.chapterName
      );

      if (existingIndex >= 0) {
        const existing = userScore.progress[existingIndex];
        existing.correctAnswers = newProgress.correctAnswers;
        existing.wrongAnswers = newProgress.wrongAnswers;
        existing.percentage =
          (existing.correctAnswers / (existing.correctAnswers + existing.wrongAnswers)) * 100;
        existing.level = level;
        existing.hasIncorrectAnswers = incorrectChapters.has(newProgress.chapterName);
      } else {
        userScore.progress.push(newProgress);
      }
    });

    userScore.aiFeedback = aiFeedbackPayload;
  }

  await userScore.save();
  return userScore;
};

/**
 * Creates or updates the overall UserProgress document (cross-subject
 * metrics). Errors here are meant to be non-blocking; the caller
 * should catch and log without failing the main request.
 */
export const updateUserProgress = async (userId, correctAnswers) => {
  let userProgress = await UserProgress.findOne({ userId });

  if (!userProgress) {
    userProgress = new UserProgress({
      userId,
      subjects: {
        science: { totalScore: 0 },
        maths: { totalScore: correctAnswers },
        english: { totalScore: 0 },
      },
    });
  } else {
    userProgress.subjects.maths.totalScore = correctAnswers;
  }

  const scores = {
    maths: userProgress.subjects?.maths?.totalScore || 0,
    science: userProgress.subjects?.science?.totalScore || 0,
    english: userProgress.subjects?.english?.totalScore || 0,
  };

  const subjectKeys = Object.keys(scores);
  userProgress.overallPerformance = {
    averageScore: (scores.maths + scores.science + scores.english) / 3,
    strongestSubject: subjectKeys.reduce((a, b) => (scores[a] > scores[b] ? a : b)),
    weakestSubject: subjectKeys.reduce((a, b) => (scores[a] < scores[b] ? a : b)),
  };

  await userProgress.save();
  return userProgress;
};