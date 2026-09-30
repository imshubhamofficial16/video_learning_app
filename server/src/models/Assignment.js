const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound unique index - one assignment per learner-video pair
assignmentSchema.index({ learnerId: 1, videoId: 1 }, { unique: true });
assignmentSchema.index({ videoId: 1 });
assignmentSchema.index({ learnerId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
