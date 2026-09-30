const Response = require('../models/Response');
const Question = require('../models/Question');

// @desc    Submit answer to a question
// @route   POST /api/responses
// @access  Private (Learner)
const submitResponse = async (req, res) => {
  try {
    const { questionId, videoId, answer } = req.body;
    const learnerId = req.user._id;

    // Validate question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Auto-grade for choice questions
    let isCorrect = null;
    if (question.questionType === 'single') {
      // For single choice, answer is option ID
      const selectedOption = question.options.find(opt => opt._id.toString() === answer);
      isCorrect = selectedOption ? selectedOption.isCorrect : false;
    } else if (question.questionType === 'multiple') {
      // For multiple choice, answer is array of option IDs
      const answerArray = Array.isArray(answer) ? answer : [answer];
      const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt._id.toString());

      // Check if arrays match (same elements, regardless of order)
      isCorrect = answerArray.length === correctOptions.length &&
                  answerArray.every(ans => correctOptions.includes(ans));
    }

    // Check if response already exists
    const existingResponse = await Response.findOne({ learnerId, questionId });

    if (existingResponse) {
      // Update existing response
      existingResponse.answer = answer;
      existingResponse.isCorrect = isCorrect;
      await existingResponse.save();
      return res.json(existingResponse);
    }

    // Create new response
    const response = await Response.create({
      learnerId,
      questionId,
      videoId,
      answer,
      isCorrect
    });

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get learner's responses for a video
// @route   GET /api/responses/video/:videoId
// @access  Private (Learner)
const getVideoResponses = async (req, res) => {
  try {
    const { videoId } = req.params;
    const learnerId = req.user._id;

    const responses = await Response.find({ learnerId, videoId })
      .populate('questionId');

    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all responses for a learner (Admin can view any learner)
// @route   GET /api/responses/learner/:learnerId
// @access  Private (Admin)
const getLearnerResponses = async (req, res) => {
  try {
    const { learnerId } = req.params;

    const responses = await Response.find({ learnerId })
      .populate('questionId')
      .populate('videoId', 'title');

    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitResponse,
  getVideoResponses,
  getLearnerResponses
};
