const Question = require('../models/Question');
const Video = require('../models/Video');

// @desc    Get all questions for a video
// @route   GET /api/videos/:videoId/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const questions = await Question.find({ videoId })
      .sort({ timestamp: 1, order: 1 });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single question
// @route   GET /api/videos/:videoId/questions/:questionId
// @access  Private
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create question
// @route   POST /api/videos/:videoId/questions
// @access  Private (Admin only)
const createQuestion = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { timestamp, questionText, questionType, options, correctAnswer, order } = req.body;

    // Validate video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Validate question type specific requirements
    if ((questionType === 'single' || questionType === 'multiple') && (!options || options.length < 2)) {
      return res.status(400).json({ message: 'At least 2 options required for choice questions' });
    }

    const question = await Question.create({
      videoId,
      timestamp,
      questionText,
      questionType,
      options: (questionType === 'single' || questionType === 'multiple') ? options : [],
      correctAnswer,
      order: order || 0
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update question
// @route   PUT /api/videos/:videoId/questions/:questionId
// @access  Private (Admin only)
const updateQuestion = async (req, res) => {
  try {
    const { timestamp, questionText, questionType, options, correctAnswer, order } = req.body;

    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update fields
    if (timestamp !== undefined) question.timestamp = timestamp;
    if (questionText) question.questionText = questionText;
    if (questionType) question.questionType = questionType;
    if (options) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (order !== undefined) question.order = order;

    const updatedQuestion = await question.save();

    res.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/videos/:videoId/questions/:questionId
// @access  Private (Admin only)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.deleteOne();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
