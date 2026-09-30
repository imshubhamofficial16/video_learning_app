const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  lastWatchedTimestamp: {
    type: Number, // in seconds
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  totalWatchTime: {
    type: Number, // in seconds
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index
progressSchema.index({ learnerId: 1, videoId: 1 }, { unique: true });
progressSchema.index({ learnerId: 1 });
progressSchema.index({ videoId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
