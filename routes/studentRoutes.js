const express = require('express');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/upload');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.postUpdateProfile);
router.get('/grades', studentController.getGrades);
router.get('/assignments', studentController.getAssignments);
router.post('/assignments/:id/submit', upload.single('file'), studentController.submitAssignment);

module.exports = router;