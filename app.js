const express = require('express');
const session = require('express-session');
const expressEjsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const morgan = require('morgan');
const methodOverride = require('method-override');
const User = require('./models/User');

require('dotenv').config();

const app = express();

// Connect to MongoDB
require('./config/db');

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Populate req.user from session & expose to views
app.use(async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select('-password');
            req.user = user;
            res.locals.user = user;
            res.locals.session = req.session;
        } catch (err) {
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
        res.locals.session = null;
    }
    res.locals.query = req.query;   // expose query params to all views
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.use(expressEjsLayouts);
app.set('layout', 'layouts/main');

// Routes
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/student', require('./routes/studentRoutes'));
app.use('/faculty', require('./routes/facultyRoutes'));
app.use('/courses', require('./routes/courseRoutes'));
app.use('/notices', require('./routes/noticeRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});