const Notice = require('../models/Notice');

// GET /notices - Fetch and display notices
exports.getAllNotices = async (req, res) => {
    try {
        const userRole = req.session.role || 'student';
        const notices = await Notice.find({
            $or: [
                { targetRole: 'all' },
                { targetRole: userRole }
            ]
        }).sort({ isPinned: -1, createdAt: -1 }).populate('author', 'name');

        // If AJAX request, return JSON
        const isAjax = req.xhr || req.get('Accept')?.includes('application/json');
        if (isAjax) {
            return res.json(notices);
        }

        res.render('notices/index', { notices });
    } catch (error) {
        res.status(500).render('error', { message: 'Error fetching notices' });
    }
};

// POST /notices - Create new notice (admin/faculty only)
exports.createNotice = async (req, res) => {
    try {
        const { title, body, targetRole } = req.body;

        if (!title || !body) {
            return res.status(400).redirect('/notices?error=Title and body are required');
        }

        const notice = new Notice({
            title,
            body,
            targetRole: targetRole || 'all',
            author: req.session.userId,
            isPinned: false
        });

        await notice.save();
        res.redirect('/notices?success=Notice created');
    } catch (error) {
        res.status(500).redirect('/notices?error=Error creating notice');
    }
};

// DELETE /notices/:id - Delete notice (admin only)
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).redirect('/notices?error=Notice not found');
        }

        if (req.session.role !== 'admin' && notice.author.toString() !== req.session.userId) {
            return res.status(403).redirect('/notices?error=Unauthorized');
        }

        await Notice.deleteOne({ _id: req.params.id });
        res.redirect('/notices?success=Notice deleted');
    } catch (error) {
        res.status(500).redirect('/notices?error=Error deleting notice');
    }
};

// PUT /notices/:id/pin - Toggle pin status (admin only)
exports.pinNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }

        notice.isPinned = !notice.isPinned;
        await notice.save();

        res.json({ isPinned: notice.isPinned });
    } catch (error) {
        res.status(500).json({ error: 'Error updating notice' });
    }
};