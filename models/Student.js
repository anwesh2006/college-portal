const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    grades: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            grade: String,
            marks: Number
        }
    ],
    gpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    attendancePercent: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema);