// models/UserProgress.models.js
import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: {
    maths: {
      totalScore: { type: Number, default: 0 },
    
    },
    science: {
      totalScore: { type: Number, default: 0 },
      
    },
    english: {
      totalScore: { type: Number, default: 0 },
      
    }
  },
  overallPerformance: {
    averageScore: { type: Number, default: 0 },
    strongestSubject: String,
    weakestSubject: String
  }
}, { timestamps: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;