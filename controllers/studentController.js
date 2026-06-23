const { validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Notice = require('../models/Notice');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Grade to GPA point mapping (10-point scale)
const gradeToPoints = { 'A+': 10, 'A': 9, 'A-': 8.5, 'B+': 8, 'B': 7, 'B-': 6.5, 'C+': 6, 'C': 5.5, 'C-': 5, 'D': 4, 'F': 0 };

// GET /student/dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const student = await Student.findOne({ userId });

        if (!student) {
            return res.render('student/dashboard', {
                student: { name: user ? user.name : 'Student', gpa: 0, attendance: 0 },
                enrollments: [],
                notices: []
            });
        }

        const enrollments = await Enrollment.find({ studentId: student._id, status: 'enrolled' }).populate('courseId');
        const notices = await Notice.find({ $or: [{ targetRole: 'all' }, { targetRole: 'student' }] }).sort({ createdAt: -1 }).limit(5);

        // Calculate GPA from grades
        let gpa = 0;
        if (student.grades && student.grades.length > 0) {
            const totalPoints = student.grades.reduce((sum, g) => sum + (gradeToPoints[g.grade] || 0), 0);
            gpa = totalPoints / student.grades.length;
        }

        res.render('student/dashboard', {
            student: {
                name: user.name,
                gpa: gpa,
                attendance: student.attendancePercent || 0
            },
            enrollments,
            notices
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

// GET /student/profile
const getProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const student = await Student.findOne({ userId });

        if (!user || !student) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profileData = {
            name: user.name,
            email: user.email,
            role: user.role,
            department: student.department,
            rollNumber: student.rollNumber,
            semester: student.semester,
            joinedDate: student.createdAt,
            phone: user.phone || ''
        };
        res.render('student/profile', profileData);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to load profile' });
    }
};

// POST /student/profile
const postUpdateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('student/profile', { errors: errors.array() });
        }
        const userId = req.session.userId;
        const { department, semester, phone } = req.body;
        await Student.findOneAndUpdate({ userId }, { department, semester });
        await User.findByIdAndUpdate(userId, { phone });
        req.session.message = 'Profile updated successfully';
        res.redirect('/student/profile');
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// GET /student/grades
const getGrades = async (req, res) => {
    try {
        const userId = req.session.userId;
        const student = await Student.findOne({ userId }).populate('grades.courseId', 'title code credits');

        if (!student || !student.grades || student.grades.length === 0) {
            return res.render('student/grades', { grades: [], gpa: 0, totalCredits: 0 });
        }

        const totalPoints = student.grades.reduce((sum, g) => sum + (gradeToPoints[g.grade] || 0), 0);
        const gpa = totalPoints / student.grades.length;

        const totalCredits = student.grades.reduce((sum, g) => {
            return sum + (g.courseId && g.courseId.credits ? g.courseId.credits : 0);
        }, 0);

        res.render('student/grades', { grades: student.grades, gpa: gpa, totalCredits });
    } catch (error) {
        console.error('Grades error:', error);
        res.status(500).json({ error: 'Failed to load grades' });
    }
};

// GET /student/assignments
const getAssignments = async (req, res) => {
    try {
        const userId = req.session.userId;
        const student = await Student.findOne({ userId });

        if (!student) {
            return res.render('student/assignments', { courseAssignments: [] });
        }

        // Get all enrolled courses
        const enrollments = await Enrollment.find({ studentId: student._id, status: 'enrolled' })
            .populate('courseId');

        const courseIds = enrollments.map(e => e.courseId._id);

        // Get all assignments for enrolled courses
        const assignments = await Assignment.find({ courseId: { $in: courseIds } })
            .populate('courseId', 'title code')
            .sort({ dueDate: 1 });

        // Get student's submissions
        const assignmentIds = assignments.map(a => a._id);
        const submissions = await Submission.find({
            assignmentId: { $in: assignmentIds },
            studentId: student._id
        });

        const submissionMap = {};
        submissions.forEach(s => { submissionMap[s.assignmentId.toString()] = s; });

        // Group by course
        const courseMap = {};
        assignments.forEach(a => {
            const courseKey = a.courseId._id.toString();
            if (!courseMap[courseKey]) {
                courseMap[courseKey] = {
                    course: a.courseId,
                    assignments: []
                };
            }
            courseMap[courseKey].assignments.push({
                ...a.toObject(),
                submission: submissionMap[a._id.toString()] || null
            });
        });

        const courseAssignments = Object.values(courseMap);

        res.render('student/assignments', { courseAssignments, studentId: student._id });
    } catch (error) {
        console.error('Assignments error:', error);
        res.status(500).json({ error: 'Failed to load assignments' });
    }
};

// POST /student/assignments/:id/submit
const submitAssignment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const assignmentId = req.params.id;
        const student = await Student.findOne({ userId });

        if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found' });

        // Check if already submitted
        const existing = await Submission.findOne({ assignmentId, studentId: student._id });
        if (existing) {
            // Update existing submission
            existing.fileUrl = '/uploads/assignments/' + req.file.filename;
            existing.originalFileName = req.file.originalname;
            existing.submittedAt = new Date();
            existing.status = 'pending';
            existing.marks = null;
            existing.feedback = '';
            await existing.save();
            return res.json({ success: true, resubmitted: true });
        }

        const submission = new Submission({
            assignmentId,
            studentId: student._id,
            fileUrl: '/uploads/assignments/' + req.file.filename,
            originalFileName: req.file.originalname
        });

        await submission.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getDashboard, getProfile, postUpdateProfile, getGrades, getAssignments, submitAssignment };