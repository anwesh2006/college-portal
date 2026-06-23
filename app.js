const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressEjsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const morgan = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
const User = require('./models/User');

require('dotenv').config();

const app = express();

// Trust proxy for secure cookies in production (Vercel)
app.set('trust proxy', 1);

// Connect to MongoDB
require('./config/db');

// Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session configuration — MongoDB-backed so it survives serverless restarts
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: 'college_portal',
        ttl: 24 * 60 * 60  // sessions expire after 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 1 day in ms
    }
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
app.set('views', path.join(__dirname, 'views'));
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

// Only start the server directly when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;