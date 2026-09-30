const Progress = require('../models/Progress');
const Video = require('../models/Video');

// @desc    Get progress for a video
// @route   GET /api/progress/video/:videoId
// @access  Private (Learner)
const getVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const learnerId = req.user._id;

    let progress = await Progress.findOne({ learnerId, videoId });

    if (!progress) {
      // Create initial progress record
      progress = await Progress.create({
        learnerId,
        videoId,
        lastWatchedTimestamp: 0,
        completionPercentage: 0
      });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update progress for a video
// @route   POST /api/progress/video/:videoId
// @access  Private (Learner)
const updateVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const learnerId = req.user._id;
    const { lastWatchedTimestamp, completionPercentage, totalWatchTime } = req.body;

    // Validate video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Calculate completion if not provided
    let calculatedCompletion = completionPercentage;
    if (!calculatedCompletion && video.duration && lastWatchedTimestamp) {
      calculatedCompletion = Math.min(100, Math.round((lastWatchedTimestamp / video.duration) * 100));
    }

    // Check if completed (watched >= 95%)
    const isCompleted = calculatedCompletion >= 95;

    let progress = await Progress.findOne({ learnerId, videoId });

    if (progress) {
      // Update existing progress
      progress.lastWatchedTimestamp = lastWatchedTimestamp || progress.lastWatchedTimestamp;
      progress.completionPercentage = calculatedCompletion || progress.completionPercentage;
      progress.isCompleted = isCompleted;
      progress.totalWatchTime = totalWatchTime || progress.totalWatchTime;
      progress.lastUpdated = Date.now();
      await progress.save();
    } else {
      // Create new progress
      progress = await Progress.create({
        learnerId,
        videoId,
        lastWatchedTimestamp: lastWatchedTimestamp || 0,
        completionPercentage: calculatedCompletion || 0,
        isCompleted,
        totalWatchTime: totalWatchTime || 0
      });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark video as completed
// @route   PATCH /api/progress/video/:videoId/complete
// @access  Private (Learner)
const markAsCompleted = async (req, res) => {
  try {
    const { videoId } = req.params;
    const learnerId = req.user._id;

    let progress = await Progress.findOne({ learnerId, videoId });

    if (!progress) {
      progress = await Progress.create({
        learnerId,
        videoId,
        completionPercentage: 100,
        isCompleted: true
      });
    } else {
      progress.completionPercentage = 100;
      progress.isCompleted = true;
      progress.lastUpdated = Date.now();
      await progress.save();
    }

    res.json({ message: 'Video marked as completed', progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all progress for a learner
// @route   GET /api/progress/my-progress
// @access  Private (Learner)
const getMyProgress = async (req, res) => {
  try {
    const learnerId = req.user._id;

    const progress = await Progress.find({ learnerId })
      .populate('videoId', 'title description thumbnailUrl duration')
      .sort({ lastUpdated: -1 });

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVideoProgress,
  updateVideoProgress,
  markAsCompleted,
  getMyProgress
};
