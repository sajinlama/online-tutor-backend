import Joi from 'joi';

import Science from '../models/science.models.js';
const schema = Joi.object({
  question: Joi.string().required().trim(),
  options: Joi.array().items(Joi.string().required()).length(4).required(),
  rightAns: Joi.string().required(),
  chapterName: Joi.string().required().trim(),
  level: Joi.string().valid('Easy', 'Medium', 'Hard').required().trim(),
 
}).custom((value, helpers) => {
  if (!value.options.includes(value.rightAns)) {
    return helpers.message('"rightAns" must be one of the options');
  }
  return value;
});

const addScienceQuestion = async (req, res) => {
 
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: "The input value should be valid. " + error.details[0].message,
    });
  }

  try {
    const { question, options, rightAns, chapterName, level } = req.body;

    const newQuestion = new Science({
      question,
      options,
      rightAns,
      chapterName,
      level
    });

    await newQuestion.save();

 
    res.status(201).json({
      message: "Math question added successfully!",
      data: newQuestion,
    });
    
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export default addScienceQuestion;
