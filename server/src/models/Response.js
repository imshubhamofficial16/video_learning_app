const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, // String for short/single, Array for multiple
    required: true
  },
  isCorrect: {
    type: Boolean, // For auto-graded questions
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes
responseSchema.index({ learnerId: 1, questionId: 1 }, { unique: true });
responseSchema.index({ learnerId: 1, videoId: 1 });
responseSchema.index({ videoId: 1 });

module.exports = mongoose.model('Response', responseSchema);
