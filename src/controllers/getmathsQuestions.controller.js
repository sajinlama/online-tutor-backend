
import Maths from "../models/mathsQuestion.models.js";


const getMathsQuestion =  async (req, res) => {
    try {
      const questions = await Maths.find({}, 'question options level  chapterName level ');
      res.status(200).json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

export default getMathsQuestion;

