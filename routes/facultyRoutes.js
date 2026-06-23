const express = require('express');
const facultyController = require('../controllers/facultyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('faculty'));

// Dashboard
router.get('/dashboard', facultyController.getDashboard);

// Course management
router.get('/courses/:id', facultyController.getCourseDetails);

// Grading
router.post('/courses/:id/grade', facultyController.postGrade);

// Assignments
router.post('/courses/:id/assignments', facultyController.createAssignment);

// Submissions
router.get('/assignments/:id/submissions', facultyController.viewSubmissions);
router.post('/submissions/:id/grade', facultyController.gradeSubmission);

module.exports = router;
