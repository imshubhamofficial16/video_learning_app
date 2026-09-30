const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getLearners
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/learners', authorize('admin'), getLearners);

router.route('/')
  .get(getAssignments)
  .post(authorize('admin'), createAssignment);

router.delete('/:id', authorize('admin'), deleteAssignment);

module.exports = router;
