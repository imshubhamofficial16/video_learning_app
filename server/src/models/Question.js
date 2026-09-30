const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  timestamp: {
    type: Number, // in seconds
    required: [true, 'Timestamp is required'],
    min: 0
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['single', 'multiple', 'short'],
    required: true
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(options) {
        // Options required for single/multiple choice
        if (this.questionType === 'single' || this.questionType === 'multiple') {
          return options && options.length >= 2;
        }
        return true;
      },
      message: 'At least 2 options required for choice questions'
    }
  },
  correctAnswer: {
    type: String, // For short answer type (optional, for reference)
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
questionSchema.index({ videoId: 1, timestamp: 1 });
questionSchema.index({ videoId: 1 });

module.exports = mongoose.model('Question', questionSchema);
