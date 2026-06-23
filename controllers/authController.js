const User = require('../models/User');
const Student = require('../models/Student');
const PasswordReset = require('../models/PasswordReset');
const { validationResult, body } = require('express-validator');
const { validateFacultyId } = require('../config/facultyRegistry');

// GET /auth/login
exports.getLogin = (req, res) => {
    if (req.session.userId) {
        const redirectMap = { admin: '/admin/panel', faculty: '/faculty/dashboard', student: '/student/dashboard' };
        return res.redirect(redirectMap[req.session.role] || '/student/dashboard');
    }
    res.render('auth/login', { error: null });
};

// GET /auth/signup
exports.getSignup = (req, res) => {
    res.render('auth/signup', { errors: [], old: {} });
};

// POST /auth/signup
exports.postSignup = [
    body('fullName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['student', 'faculty']).withMessage('Invalid role'),

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('auth/signup', {
                errors: errors.array(),
                old: req.body
            });
        }

        try {
            const { fullName, email, password, role, department, semester, facultyId } = req.body;

            // BLOCK admin signup entirely
            if (role === 'admin') {
                return res.status(403).render('auth/signup', {
                    errors: [{ msg: 'Admin accounts cannot be created through signup. Contact the system administrator.' }],
                    old: req.body
                });
            }

            // VALIDATE faculty ID if signing up as faculty
            if (role === 'faculty') {
                if (!facultyId || !facultyId.trim()) {
                    return res.status(400).render('auth/signup', {
                        errors: [{ msg: 'Faculty ID is required for faculty registration.' }],
                        old: req.body
                    });
                }

                const facultyRecord = validateFacultyId(facultyId);
                if (!facultyRecord) {
                    return res.status(400).render('auth/signup', {
                        errors: [{ msg: 'Invalid Faculty ID. Please contact the administration to get your approved Faculty ID.' }],
                        old: req.body
                    });
                }

                // Check if this faculty ID has already been used
                const alreadyUsed = await User.findOne({ facultyId: facultyId.trim().toUpperCase() });
                if (alreadyUsed) {
                    return res.status(400).render('auth/signup', {
                        errors: [{ msg: 'This Faculty ID has already been registered. If this is an error, contact the administrator.' }],
                        old: req.body
                    });
                }
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).render('auth/signup', {
                    errors: [{ msg: 'Email already registered' }],
                    old: req.body
                });
            }

            // Create user (password hashed by pre-save hook)
            const userData = {
                name: fullName,
                email,
                password,
                role
            };

            // Store faculty ID and department from registry
            if (role === 'faculty') {
                const facultyRecord = validateFacultyId(facultyId);
                userData.facultyId = facultyId.trim().toUpperCase();
                userData.department = facultyRecord.department;
            }

            if (role === 'student') {
                userData.department = department;
            }

            const user = new User(userData);
            await user.save();

            // If student, create a Student profile
            if (role === 'student') {
                const rollNumber = 'STU' + Date.now().toString().slice(-6);
                await new Student({
                    userId: user._id,
                    rollNumber,
                    department: department || 'Undeclared',
                    semester: parseInt(semester) || 1
                }).save();
            }

            // Auto-login after signup
            req.session.userId = user._id;
            req.session.role = user.role;

            // Redirect to appropriate dashboard
            const redirectMap = { faculty: '/faculty/dashboard', student: '/student/dashboard' };
            const redirectUrl = redirectMap[user.role] || '/student/dashboard';
            return res.redirect(redirectUrl);

        } catch (err) {
            console.error(err);
            return res.status(500).render('auth/signup', {
                errors: [{ msg: 'Server error. Please try again.' }],
                old: req.body
            });
        }
    }
];

// POST /auth/login
exports.postLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const isAjax = req.xhr || req.get('Accept')?.includes('application/json');
            if (isAjax) return res.status(400).json({ errors: errors.array() });
            return res.render('auth/login', { error: errors.array()[0].msg });
        }

        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user || !(await user.comparePassword(password))) {
                const isAjax = req.xhr || req.get('Accept')?.includes('application/json');
                if (isAjax) return res.status(401).json({ error: 'Invalid credentials' });
                return res.render('auth/login', {
                    error: 'Invalid email or password'
                });
            }

            req.session.userId = user._id;
            req.session.role = user.role;

            const isAjax = req.xhr || req.get('Accept')?.includes('application/json');
            const redirectMap = { admin: '/admin/panel', faculty: '/faculty/dashboard', student: '/student/dashboard' };
            const redirectUrl = redirectMap[user.role] || '/student/dashboard';

            if (isAjax) return res.json({ success: true, redirect: redirectUrl });
            return res.redirect(redirectUrl);
        } catch (err) {
            const isAjax = req.xhr || req.get('Accept')?.includes('application/json');
            if (isAjax) return res.status(500).json({ error: 'Server error' });
            return res.render('auth/login', {
                error: 'Server error'
            });
        }
    }
];

// GET /auth/logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Logout failed');
        res.redirect('/auth/login');
    });
};

// ─── Forgot / Reset Password ──────────────────────────────────────────────────
// Tokens are stored in MongoDB (PasswordReset model) so they survive
// serverless function restarts on Vercel. MongoDB TTL index auto-expires them.

function generateToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

// GET /auth/forgot-password
exports.getForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { error: null, old: {} });
};

// POST /auth/forgot-password  — verify email, issue token, show reset form
exports.postForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.render('auth/forgot-password', {
            error: 'Please enter your email address.',
            old: { email }
        });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Generic message even if not found — prevents user enumeration
        if (!user || user.role === 'admin') {
            return res.render('auth/forgot-password', {
                error: 'If this email is registered, you can proceed to reset your password.',
                old: { email }
            });
        }

        // Delete any existing tokens for this email, then create a new 15-min token
        await PasswordReset.deleteMany({ email: user.email });
        const token = generateToken();
        await PasswordReset.create({
            email: user.email,
            token,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)  // 15 minutes
        });

        // Render reset form directly (no email needed)
        return res.render('auth/reset-password', {
            email: user.email,
            token,
            error: null
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        return res.render('auth/forgot-password', {
            error: 'Server error. Please try again.',
            old: { email }
        });
    }
};

// POST /auth/reset-password  — validate token, update password
exports.postResetPassword = async (req, res) => {
    const { email, token, password, confirmPassword } = req.body;

    const renderError = (msg) =>
        res.render('auth/reset-password', { email, token, error: msg });

    try {
        // Validate token from DB
        const record = await PasswordReset.findOne({ token, email });
        if (!record || new Date() > record.expiresAt) {
            return renderError('Your reset link has expired or is invalid. Please request a new one.');
        }

        if (!password || password.length < 8) {
            return renderError('Password must be at least 8 characters.');
        }

        if (password !== confirmPassword) {
            return renderError('Passwords do not match.');
        }

        const user = await User.findOne({ email });
        if (!user) return renderError('Account not found.');

        // Update password — pre-save hook will hash it
        user.password = password;
        user.markModified('password');
        await user.save();

        // Invalidate token after use
        await PasswordReset.deleteOne({ token });

        // Redirect to login with success message
        return res.redirect('/auth/login?reset=success');

    } catch (err) {
        console.error('Reset password error:', err);
        return renderError('Server error. Please try again.');
    }
};