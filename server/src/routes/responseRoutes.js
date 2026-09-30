const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getVideoResponses,
  getLearnerResponses
} = require('../controllers/responseController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/', submitResponse);
router.get('/video/:videoId', getVideoResponses);
router.get('/learner/:learnerId', authorize('admin'), getLearnerResponses);

module.exports = router;
