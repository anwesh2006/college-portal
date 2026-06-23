const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');

// GET /courses - Fetch all active courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true })
            .populate('facultyId', 'name email');

        let enrolledCourseIds = [];
        if (req.session.role === 'student') {
            const student = await Student.findOne({ userId: req.session.userId });
            if (student) {
                const enrollments = await Enrollment.find({ studentId: student._id, status: 'enrolled' });
                enrolledCourseIds = enrollments.map(e => e.courseId.toString());
            }
        }

        res.render('courses/list', {
            courses,
            enrolledCourseIds,
            userRole: req.session.role || 'student'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /courses/:id - Fetch single course details
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('facultyId', 'name email department');

        if (!course) return res.status(404).json({ error: 'Course not found' });

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /courses - Create new course (admin/faculty only)
exports.createCourse = async (req, res) => {
    try {
        const { title, code, credits, department, description, totalSlots, facultyId } = req.body;

        if (!title || !code || !credits || !department) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const course = new Course({
            title,
            code,
            credits,
            department,
            description,
            totalSlots: totalSlots || 60,
            facultyId: facultyId || req.session.userId,
            isActive: true
        });

        await course.save();
        res.redirect('/courses');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /courses/:id - Update course (admin only)
exports.updateCourse = async (req, res) => {
    try {
        const { title, code, credits, department, description, totalSlots } = req.body;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { title, code, credits, department, description, totalSlots },
            { new: true }
        );

        if (!course) return res.status(404).json({ error: 'Course not found' });

        res.redirect('/courses?message=Course updated successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /courses/:id - Soft delete course (admin only)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!course) return res.status(404).json({ error: 'Course not found' });

        res.redirect('/courses?message=Course deleted successfully');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /courses/:id/enroll - Enroll student in course
exports.enrollStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findOne({ userId: req.session.userId });

        if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

        if (course.enrolledCount >= course.totalSlots) {
            return res.status(400).json({ success: false, error: 'Course full' });
        }

        const existing = await Enrollment.findOne({ courseId: id, studentId: student._id, status: 'enrolled' });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Already enrolled' });
        }

        const enrollment = new Enrollment({ courseId: id, studentId: student._id, status: 'enrolled' });
        await enrollment.save();

        await Course.findByIdAndUpdate(id, { $inc: { enrolledCount: 1 } });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /courses/:id/drop - Drop course
exports.dropCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findOne({ userId: req.session.userId });

        if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

        const enrollment = await Enrollment.findOneAndUpdate(
            { courseId: id, studentId: student._id, status: 'enrolled' },
            { status: 'dropped', droppedAt: new Date() },
            { new: true }
        );

        if (!enrollment) return res.status(404).json({ success: false, error: 'Enrollment not found' });

        await Course.findByIdAndUpdate(id, { $inc: { enrolledCount: -1 } });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /courses/:id/claim - Claim course (faculty only)
exports.claimCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
        
        if (course.facultyId) {
            return res.status(400).json({ success: false, error: 'Course already has an instructor assigned' });
        }

        course.facultyId = req.session.userId;
        await course.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};