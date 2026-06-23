const express = require('express');
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const methodOverride = require('method-override');

const router = express.Router();

// Apply method-override middleware
router.use(methodOverride('_method'));

// GET all courses (authenticated users)
router.get('/', authMiddleware, courseController.getAllCourses);

// GET course by ID (authenticated users)
router.get('/:id', authMiddleware, courseController.getCourseById);

// POST create course (admin or faculty only)
router.post('/', authMiddleware, roleMiddleware(['admin', 'faculty']), courseController.createCourse);

// POST claim course (faculty only)
router.post('/:id/claim', authMiddleware, roleMiddleware(['faculty']), courseController.claimCourse);

// PUT update course (admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), courseController.updateCourse);

// DELETE course (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), courseController.deleteCourse);

// POST enroll student in course (student only)
router.post('/:id/enroll', authMiddleware, roleMiddleware(['student']), courseController.enrollStudent);

// DELETE drop course (student only)
router.delete('/:id/drop', authMiddleware, roleMiddleware(['student']), courseController.dropCourse);

module.exports = router;