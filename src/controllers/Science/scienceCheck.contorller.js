
import Science from "../../models/science.models.js";
import ScienceScore from "../../models/scienceScore.models.js"
import UserProgress from "../../models/users/userProgress.models.js";
import { generateAIFeedback } from "../../utils/aiFeedback.js"



const checkAnsScience = async (req, res) => {
  try {
    const { userId, chapterName, answers, level } = req.body;
    console.log("hello sajin lama this is science");
    
    if (!Array.isArray(answers) || !chapterName || !userId) {
      return res.status(400).json({
        error: "Invalid request format. Answers must be an array, and userId and chapterName are required."
      });
    }
    
    // Extract question IDs from frontend answers
    const questionIds = answers.map(ans => ans.questionId);
    
    // Fetch correct answers for those questions from DB
    const questions = await Science.find(
      { _id: { $in: questionIds } },
      '_id rightAns chapterName'
    );
    
    // Create a map of questionId -> correct answer
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = {
        rightAns: q.rightAns,
        chapterName: q.chapterName
      };
    });
    
    let correctAnswers = 0;
    let wrongAnswers = 0;
    
    // Group answers by chapter for better feedback and progress tracking
    const chapterResults = {};
    const incorrectChapters = new Set(); // Track chapters with incorrect answers
    
    // Compare each user's answer to the correct one
    answers.forEach(ans => {
      const questionInfo = questionMap[ans.questionId];
      
      if (!questionInfo) {
        console.log(`Question ID ${ans.questionId} not found in database`);
        return;
      }
      
      const correct = questionInfo.rightAns;
      const chapterName = ans.chapterName || questionInfo.chapterName;
      
      // Initialize chapter statistics if not already present
      if (!chapterResults[chapterName]) {
        chapterResults[chapterName] = {
          correctAnswers: 0,
          wrongAnswers: 0
        };
      }
      
      if (correct === ans.selectedAnswer) {
        correctAnswers++;
        chapterResults[chapterName].correctAnswers++;
        console.log(`✅ Correct answer for ${chapterName}! Total score so far: ${correctAnswers}`);
      } else {
        wrongAnswers++;
        chapterResults[chapterName].wrongAnswers++;
        incorrectChapters.add(chapterName); // Mark this chapter as having incorrect answers
        console.log(`❌ Wrong answer for ${chapterName}. User selected: ${ans.selectedAnswer}, correct was: ${correct}`);
      }
    });
    
    const totalAnswered = correctAnswers + wrongAnswers;
    const percentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
    
    // Convert chapter results to array format for saving to database
    const progressArray = Object.keys(chapterResults).map(chapter => {
      const chapterData = chapterResults[chapter];
      const chapterTotal = chapterData.correctAnswers + chapterData.wrongAnswers;
      const chapterPercentage = chapterTotal > 0 ? 
        (chapterData.correctAnswers / chapterTotal) * 100 : 0;
      
      return {
        chapterName: chapter,
        correctAnswers: chapterData.correctAnswers,
        wrongAnswers: chapterData.wrongAnswers,
        percentage: chapterPercentage,
        level,
        // Add a flag for chapters with incorrect answers
        hasIncorrectAnswers: incorrectChapters.has(chapter)
      };
    });
    
    // Get all chapter names and identify weak chapters (below 50%)
    const allChapters = progressArray.map(item => item.chapterName);
    const weakChapters = progressArray
      .filter(item => item.percentage < 50)
      .map(item => item.chapterName);
    const chaptersWithErrors = Array.from(incorrectChapters);
    
    // Generate AI feedback based on progress
    const feedbackData = await generateAIFeedback(progressArray, "science");

    console.log(feedbackData);
    
  
    let userScore = await ScienceScore.findOne({ userId });
    
    if (!userScore) {
      // Create new score document if none exists
      userScore = new ScienceScore({
        userId,
        totalScore: correctAnswers,
        progress: progressArray,
        aiFeedback: {
          ...feedbackData,
          weakChapters, // Add weak chapters to feedback
          chaptersWithErrors // Add chapters with errors
        }
      });
    } else {
      // Update existing score document
      userScore.totalScore = correctAnswers;  // Replace instead of += to reset score
      
      // Update or add chapter progress
      progressArray.forEach(newProgress => {
        const existingIndex = userScore.progress.findIndex(
          p => p.chapterName === newProgress.chapterName
        );
        
        if (existingIndex >= 0) {
          // Replace existing chapter progress instead of adding to it
          const existing = userScore.progress[existingIndex];
          existing.correctAnswers = newProgress.correctAnswers;  // Replace instead of +=
          existing.wrongAnswers = newProgress.wrongAnswers;      // Replace instead of +=
          existing.percentage = 
            (existing.correctAnswers / (existing.correctAnswers + existing.wrongAnswers)) * 100;
          existing.level = level; // Update level
          existing.hasIncorrectAnswers = incorrectChapters.has(newProgress.chapterName);
        } else {
          // Add new chapter progress
          userScore.progress.push(newProgress);
        }
      });
      
      // Update AI feedback
      userScore.aiFeedback = {
        ...feedbackData,
        weakChapters, // Add weak chapters to feedback
        chaptersWithErrors // Add chapters with errors
      };
    }
    
    // Save the updated score document
    await userScore.save();
    
    // ===== SIMPLIFIED CODE TO UPDATE JUST SCIENCE TOTAL SCORE IN USER PROGRESS =====
    
    try {
      // Find or create UserProgress document using findOneAndUpdate
      // This is more efficient than separate find and save operations
      await UserProgress.findOneAndUpdate(
        { userId }, // find by userId
        { 
          // Reset science score to current correctAnswers count
          $set: { "subjects.science.totalScore": correctAnswers },
          
          // if document doesn't exist, create it with these default values
          $setOnInsert: { 
            userId,
            "subjects.maths.totalScore": 0,
            "subjects.english.totalScore": 0,
            "overallPerformance.averageScore": correctAnswers / 3, // initial average
            "overallPerformance.strongestSubject": "science",
            "overallPerformance.weakestSubject": "maths" // default
          }
        },
        { 
          new: true, // return updated document
          upsert: true // create if doesn't exist
        }
      );

      // Calculate and update the overall performance in a separate operation
      const userProgress = await UserProgress.findOne({ userId });
      if (userProgress) {
        // Calculate average score
        const mathsScore = userProgress.subjects.maths.totalScore || 0;
        const scienceScore = userProgress.subjects.science.totalScore || 0;
        const englishScore = userProgress.subjects.english.totalScore || 0;
        
        userProgress.overallPerformance.averageScore = 
          (mathsScore + scienceScore + englishScore) / 3;
        
        // Determine strongest and weakest subjects
        const scores = {
          maths: mathsScore,
          science: scienceScore,
          english: englishScore
        };
        
        const subjects = Object.keys(scores);
        userProgress.overallPerformance.strongestSubject = subjects.reduce((a, b) => scores[a] > scores[b] ? a : b);
        userProgress.overallPerformance.weakestSubject = subjects.reduce((a, b) => scores[a] < scores[b] ? a : b);
        
        await userProgress.save();
      }
    } catch (progressError) {
      console.error("Error updating UserProgress:", progressError);
      // Continue execution - don't fail the main function if UserProgress update fails
    }
    
    
    // Send result
    res.status(200).json({
      correctAnswers,
      wrongAnswers,
      percentage,
      totalScore: correctAnswers,
      feedback: {
        ...feedbackData,
        weakChapters, // Include weak chapters in response
        chaptersWithErrors, // Include chapters with errors in response
        allChapters // Include all attempted chapters
      }
    });
  } catch (error) {
    console.error("Error checking answers:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

export default checkAnsScience;