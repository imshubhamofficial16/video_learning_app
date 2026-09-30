const express = require('express');
const router = express.Router();
const {
  getAllLearners,
  getLearnerDetails,
  getVideoAnalytics,
  getLearnerVideoProgress
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/learners', getAllLearners);
router.get('/learner/:learnerId', getLearnerDetails);
router.get('/video/:videoId/analytics', getVideoAnalytics);
router.get('/learner/:learnerId/video/:videoId', getLearnerVideoProgress);

module.exports = router;
