const express = require('express');
const router = express.Router();
const {
  getVideoProgress,
  updateVideoProgress,
  markAsCompleted,
  getMyProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/my-progress', getMyProgress);
router.get('/video/:videoId', getVideoProgress);
router.post('/video/:videoId', updateVideoProgress);
router.patch('/video/:videoId/complete', markAsCompleted);

module.exports = router;
