const User = require('../models/User');

module.exports = {
    checkNotLogged: (req, res, next) => {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');
    },
    checkLogged: (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect('back');
        }
        next();
    },
};