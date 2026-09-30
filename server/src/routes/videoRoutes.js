const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  togglePublish,
  streamVideo
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const questionRoutes = require('./questionRoutes');

// Fields accepted on video upload
const videoUploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// All routes require authentication
router.use(protect);

// Streaming endpoint (supports HTTP range requests for seeking)
router.get('/:id/stream', streamVideo);

router.route('/')
  .get(getVideos)
  .post(authorize('admin'), videoUploadFields, createVideo);

router.route('/:id')
  .get(getVideoById)
  .put(authorize('admin'), updateVideo)
  .delete(authorize('admin'), deleteVideo);

router.patch('/:id/publish', authorize('admin'), togglePublish);

// Nested question routes
router.use('/:videoId/questions', questionRoutes);

module.exports = router;
