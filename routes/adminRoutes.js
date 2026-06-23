const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply auth and admin role protection to all routes
router.use(authMiddleware, roleMiddleware('admin'));

// Admin panel
router.get('/panel', adminController.getPanel);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Reports
router.get('/reports', adminController.getReports);

// Notices (admin layout)
router.get('/notices', adminController.getNotices);

// Courses (admin layout)
router.get('/courses', adminController.getCourses);

// Faculty Registry
router.get('/faculty-registry', adminController.getFacultyRegistry);

module.exports = router;