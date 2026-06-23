const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notice = require('../models/Notice');

// GET /admin/panel
exports.getPanel = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        const recentNotices = await Notice.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name');

        const stats = { totalUsers, totalStudents, totalCourses, totalEnrollments };
        res.render('admin/panel', { layout: false, stats, recentUsers, recentNotices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await User.countDocuments();
        const pages = Math.ceil(total / limit);

        res.render('admin/users', { layout: false, users, page, pages, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /admin/users/:id/role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'faculty', 'admin'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json({ success: true, role: user.role });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /admin/users
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, rollNumber, semester } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, error: 'Name, email, password, and role are required' });
        }

        const validRoles = ['student', 'faculty', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'A user with this email already exists' });
        }

        // Create the user
        const user = new User({ name, email, password, role, department });
        await user.save();

        // If role is student, also create a Student record
        if (role === 'student' && department) {
            const student = new Student({
                userId: user._id,
                rollNumber: rollNumber || ('STU-' + Date.now()),
                department: department,
                semester: parseInt(semester) || 1
            });
            await student.save();
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plainPassword: user.plainPassword,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Student.deleteOne({ userId: req.params.id });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /admin/reports
exports.getReports = async (req, res) => {
    try {
        const enrollmentsByCourse = await Enrollment.aggregate([
            { $group: { _id: '$courseId', count: { $sum: 1 } } },
            { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            { $project: { courseName: '$course.title', count: 1 } }
        ]);

        const studentsByDept = await Student.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $project: { department: '$_id', count: 1, _id: 0 } }
        ]);

        res.render('admin/reports', { layout: false, enrollmentsByCourse, studentsByDept });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /admin/notices
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .sort({ isPinned: -1, createdAt: -1 })
            .populate('author', 'name');

        res.render('admin/notices', { layout: false, notices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /admin/courses
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).populate('facultyId', 'name');
        res.render('admin/courses', { layout: false, courses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /admin/faculty-registry
exports.getFacultyRegistry = async (req, res) => {
    try {
        const { approvedFaculty } = require('../config/facultyRegistry');

        // Get all registered faculty users
        const registeredFaculty = await User.find({ role: 'faculty' }).select('+plainPassword');

        // Build a map of facultyId -> user for quick lookup
        const usedIds = new Map();
        registeredFaculty.forEach(u => {
            if (u.facultyId) usedIds.set(u.facultyId, u);
        });

        // Merge registry with registration status
        const facultyList = approvedFaculty.map(f => ({
            ...f,
            registered: usedIds.has(f.facultyId),
            user: usedIds.get(f.facultyId) || null
        }));

        const registeredCount = facultyList.filter(f => f.registered).length;
        const availableCount = facultyList.length - registeredCount;

        res.render('admin/faculty-registry', {
            layout: false,
            facultyList,
            registeredCount,
            availableCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};