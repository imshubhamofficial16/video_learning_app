const express = require('express');
const router = express.Router({ mergeParams: true }); // To access videoId from parent router
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getQuestions)
  .post(authorize('admin'), createQuestion);

router.route('/:questionId')
  .get(getQuestionById)
  .put(authorize('admin'), updateQuestion)
  .delete(authorize('admin'), deleteQuestion);

module.exports = router;
