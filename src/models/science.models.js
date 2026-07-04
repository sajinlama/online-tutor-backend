// models/question.js

import mongoose from "mongoose";

const scienceQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (v) => v.length === 4,
      message: "There must be exactly 4 options.",
    },
    required: true,
  },
  rightAns: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.options.includes(v);
      },
      message: "The correct answer must be one of the options.",
    },
  },
  chapterName: {
    type: String,
    required: true,
  },
 
  level: {
    type:String,
    required: true,
  },
 
});

 const Science= mongoose.model("Science", scienceQuestionSchema);

 export default Science;
