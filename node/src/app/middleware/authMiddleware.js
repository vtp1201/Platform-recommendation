const User = require('../models/User');

module.exports = {
    checkNotLogged: (req, res, next) => {
        User.findById(req.session.userId)
            .then((user) => next())
            .catch((error) => res.redirect('back'));
    },
    checkLogged: (req, res, next) => {
        if (req.session.userId) {
            return res.redirect('back');
        }
        next();
    },
};