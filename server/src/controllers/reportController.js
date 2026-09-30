const User = require('../models/User');
const Video = require('../models/Video');
const Progress = require('../models/Progress');
const Response = require('../models/Response');
const Assignment = require('../models/Assignment');

// @desc    Get all learners with their stats
// @route   GET /api/reports/learners
// @access  Private (Admin only)
const getAllLearners = async (req, res) => {
  try {
    const learners = await User.find({ role: 'learner' }).select('-password');

    const learnersWithStats = await Promise.all(
      learners.map(async (learner) => {
        const assignedCount = await Assignment.countDocuments({ learnerId: learner._id });
        const progressData = await Progress.find({ learnerId: learner._id });
        const completedCount = progressData.filter(p => p.isCompleted).length;
        const inProgressCount = progressData.filter(p => !p.isCompleted && p.completionPercentage > 0).length;

        return {
          ...learner.toObject(),
          stats: {
            assigned: assignedCount,
            completed: completedCount,
            inProgress: inProgressCount
          }
        };
      })
    );

    res.json(learnersWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get specific learner's detailed progress
// @route   GET /api/reports/learner/:learnerId
// @access  Private (Admin only)
const getLearnerDetails = async (req, res) => {
  try {
    const { learnerId } = req.params;

    const learner = await User.findById(learnerId).select('-password');
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found' });
    }

    const [assignments, progress, responses] = await Promise.all([
      Assignment.find({ learnerId }).populate('videoId', 'title duration'),
      Progress.find({ learnerId }).populate('videoId', 'title description thumbnailUrl duration'),
      Response.find({ learnerId }).populate('questionId').populate('videoId', 'title')
    ]);

    res.json({
      learner,
      assignments,
      progress,
      responses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get video analytics
// @route   GET /api/reports/video/:videoId/analytics
// @access  Private (Admin only)
const getVideoAnalytics = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const [assignedCount, progressData, responses] = await Promise.all([
      Assignment.countDocuments({ videoId }),
      Progress.find({ videoId }).populate('learnerId', 'fullName email'),
      Response.find({ videoId }).populate('learnerId', 'fullName')
    ]);

    const completedCount = progressData.filter(p => p.isCompleted).length;
    const inProgressCount = progressData.filter(p => !p.isCompleted && p.completionPercentage > 0).length;
    const notStartedCount = assignedCount - progressData.length;

    const averageCompletion = progressData.length > 0
      ? progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / progressData.length
      : 0;

    res.json({
      video,
      stats: {
        assigned: assignedCount,
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        averageCompletion: Math.round(averageCompletion)
      },
      progressDetails: progressData,
      responseCount: responses.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get learner progress on specific video
// @route   GET /api/reports/learner/:learnerId/video/:videoId
// @access  Private (Admin only)
const getLearnerVideoProgress = async (req, res) => {
  try {
    const { learnerId, videoId } = req.params;

    const [learner, video, progress, responses] = await Promise.all([
      User.findById(learnerId).select('-password'),
      Video.findById(videoId),
      Progress.findOne({ learnerId, videoId }),
      Response.find({ learnerId, videoId }).populate('questionId')
    ]);

    if (!learner || !video) {
      return res.status(404).json({ message: 'Learner or video not found' });
    }

    res.json({
      learner,
      video,
      progress,
      responses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllLearners,
  getLearnerDetails,
  getVideoAnalytics,
  getLearnerVideoProgress
};
