const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notice = require('../models/Notice');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// GET /faculty/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;

        const courses = await Course.find({ facultyId: userId, isActive: true });
        const courseIds = courses.map(c => c._id);
        const totalStudents = await Enrollment.countDocuments({ courseId: { $in: courseIds }, status: 'enrolled' });
        const totalAssignments = await Assignment.countDocuments({ courseId: { $in: courseIds } });

        const notices = await Notice.find({
            $or: [{ targetRole: 'all' }, { targetRole: 'faculty' }]
        }).sort({ createdAt: -1 }).limit(5);

        res.render('faculty/dashboard', { courses, totalStudents, totalAssignments, notices });
    } catch (err) {
        console.error('Faculty dashboard error:', err);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

// GET /faculty/courses/:id
exports.getCourseDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const courseId = req.params.id;

        const course = await Course.findOne({ _id: courseId, facultyId: userId });
        if (!course) {
            return res.status(404).send('Course not found or you are not authorized to view it.');
        }

        const enrollments = await Enrollment.find({ courseId: course._id, status: 'enrolled' })
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            });

        const assignments = await Assignment.find({ courseId: course._id }).sort({ dueDate: -1 });

        // Get submission counts per assignment
        const assignmentIds = assignments.map(a => a._id);
        const submissionCounts = await Submission.aggregate([
            { $match: { assignmentId: { $in: assignmentIds } } },
            { $group: { _id: '$assignmentId', count: { $sum: 1 }, graded: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } } } }
        ]);
        const countMap = {};
        submissionCounts.forEach(s => { countMap[s._id.toString()] = { count: s.count, graded: s.graded }; });

        res.render('faculty/course-details', {
            layout: false,
            course,
            enrollments,
            assignments,
            submissionCounts: countMap,
            totalEnrolled: enrollments.length
        });
    } catch (err) {
        console.error('Course details error:', err);
        res.status(500).send('Server Error');
    }
};

// POST /faculty/courses/:id/grade — Grade a student for the course
exports.postGrade = async (req, res) => {
    try {
        const userId = req.session.userId;
        const courseId = req.params.id;
        const { studentId, grade, marks } = req.body;

        // Verify faculty owns this course
        const course = await Course.findOne({ _id: courseId, facultyId: userId });
        if (!course) return res.status(403).json({ success: false, error: 'Not authorized' });

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

        // Check if grade already exists for this course, update if so
        const existingIdx = student.grades.findIndex(g => g.courseId && g.courseId.toString() === courseId);
        if (existingIdx >= 0) {
            student.grades[existingIdx].grade = grade;
            student.grades[existingIdx].marks = parseInt(marks) || 0;
        } else {
            student.grades.push({
                courseId: courseId,
                grade: grade,
                marks: parseInt(marks) || 0
            });
        }

        student.markModified('grades');
        await student.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Grade error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /faculty/courses/:id/assignments — Create assignment
exports.createAssignment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const courseId = req.params.id;
        const { title, description, dueDate, totalMarks } = req.body;

        const course = await Course.findOne({ _id: courseId, facultyId: userId });
        if (!course) return res.status(403).json({ success: false, error: 'Not authorized' });

        const assignment = new Assignment({
            courseId,
            title,
            description,
            dueDate: new Date(dueDate),
            totalMarks: parseInt(totalMarks) || 100,
            createdBy: userId
        });

        await assignment.save();
        res.redirect('/faculty/courses/' + courseId);
    } catch (err) {
        console.error('Create assignment error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /faculty/assignments/:id/submissions — View all submissions for an assignment
exports.viewSubmissions = async (req, res) => {
    try {
        const userId = req.session.userId;
        const assignmentId = req.params.id;

        const assignment = await Assignment.findById(assignmentId).populate('courseId');
        if (!assignment) return res.status(404).send('Assignment not found');

        // Verify faculty owns the course
        if (assignment.courseId.facultyId.toString() !== userId) {
            return res.status(403).send('Not authorized');
        }

        const submissions = await Submission.find({ assignmentId })
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ submittedAt: -1 });

        // Get total enrolled students for this course
        const totalEnrolled = await Enrollment.countDocuments({
            courseId: assignment.courseId._id,
            status: 'enrolled'
        });

        res.render('faculty/submissions', {
            layout: false,
            assignment,
            submissions,
            totalEnrolled
        });
    } catch (err) {
        console.error('View submissions error:', err);
        res.status(500).send('Server Error');
    }
};

// POST /faculty/submissions/:id/grade — Grade a submission
exports.gradeSubmission = async (req, res) => {
    try {
        const userId = req.session.userId;
        const submissionId = req.params.id;
        const { marks, feedback } = req.body;

        const submission = await Submission.findById(submissionId).populate({
            path: 'assignmentId',
            populate: { path: 'courseId' }
        });

        if (!submission) return res.status(404).json({ success: false, error: 'Submission not found' });

        // Verify faculty owns the course
        if (submission.assignmentId.courseId.facultyId.toString() !== userId) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        submission.marks = parseInt(marks) || 0;
        submission.feedback = feedback || '';
        submission.status = 'graded';
        submission.gradedAt = new Date();
        await submission.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Grade submission error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
