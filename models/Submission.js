const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    originalFileName: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'graded'],
        default: 'pending'
    },
    marks: {
        type: Number,
        default: null
    },
    feedback: {
        type: String,
        default: ''
    },
    gradedAt: {
        type: Date
    }
});

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
