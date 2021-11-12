const User = require('../models/User');

module.exports = {
    checkNotLogged: (req, res, next) => {
        User.findById(req.session.userId, (error, user) => {
            if (error || !user)
            return res.redirect('/')
            next()
            })
    },
    checkLogged: (req, res, next) => {
        if (req.session.userId) {
            return res.redirect('back');
        }
        next();
    },
};