module.exports = function (role) {
    return function (req, res, next) {
        if (!req.session || !req.session.userId) {
            return res.redirect('/auth/login');
        }

        // Support both single string and array of roles
        const allowedRoles = Array.isArray(role) ? role : [role];
        if (!allowedRoles.includes(req.session.role)) {
            return res.status(403).send("Access denied");
        }

        next();
    };
};