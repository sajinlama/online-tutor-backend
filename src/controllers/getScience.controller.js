
import Science from "../models/science.models.js";


const getScienceQestion =  async (req, res) => {
    try {
      const questions = await Science.find({}, 'question options level  chapterName level ');
      res.status(200).json(questions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

export default getScienceQestion;

