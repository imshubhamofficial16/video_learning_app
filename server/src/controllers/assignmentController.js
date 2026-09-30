const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Video = require('../models/Video');

// @desc    Get all assignments (filtered by role)
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'learner') {
      // Learners see only their assignments
      query.learnerId = req.user._id;
    }
    // Admins see all assignments

    const assignments = await Assignment.find(query)
      .populate('videoId', 'title description thumbnailUrl duration isPublished')
      .populate('learnerId', 'fullName email')
      .populate('assignedBy', 'fullName')
      .sort({ assignedAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create assignment (assign video to learner(s))
// @route   POST /api/assignments
// @access  Private (Admin only)
const createAssignment = async (req, res) => {
  try {
    const { videoId, learnerIds, dueDate } = req.body;

    // Validate video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Validate learners exist
    const learners = await User.find({ _id: { $in: learnerIds }, role: 'learner' });
    if (learners.length !== learnerIds.length) {
      return res.status(400).json({ message: 'Some learner IDs are invalid' });
    }

    const assignments = [];
    const errors = [];

    for (const learnerId of learnerIds) {
      try {
        const assignment = await Assignment.create({
          videoId,
          learnerId,
          assignedBy: req.user._id,
          dueDate: dueDate || undefined
        });
        assignments.push(assignment);
      } catch (err) {
        // Handle duplicate assignment error
        if (err.code === 11000) {
          errors.push(`Video already assigned to learner ${learnerId}`);
        } else {
          errors.push(err.message);
        }
      }
    }

    res.status(201).json({
      message: `Assigned to ${assignments.length} learner(s)`,
      assignments,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.deleteOne();

    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all learners (for assignment dropdown)
// @route   GET /api/assignments/learners
// @access  Private (Admin only)
const getLearners = async (req, res) => {
  try {
    const learners = await User.find({ role: 'learner' })
      .select('fullName email')
      .sort({ fullName: 1 });

    res.json(learners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getLearners
};
