const express = require('express');
const noticeController = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// GET all notices (authenticated users)
router.get('/', authMiddleware, noticeController.getAllNotices);

// POST create notice (admin or faculty)
router.post('/', authMiddleware, roleMiddleware(['admin', 'faculty']), noticeController.createNotice);

// DELETE notice (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), noticeController.deleteNotice);

// PUT pin notice (admin only)
router.put('/:id/pin', authMiddleware, roleMiddleware(['admin']), noticeController.pinNotice);

module.exports = router;