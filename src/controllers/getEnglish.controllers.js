
import English from "../models/english.models.js";


const getEnglishQuestion =  async (req, res) => {
    try {
      const questions = await English.find({}, 'question options level  chapterName level ');
      res.status(200).json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

export default getEnglishQuestion;

