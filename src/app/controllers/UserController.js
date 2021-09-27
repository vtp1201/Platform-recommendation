const { mutipleMongooseToObject } = require('../../util/mongoose');
const User = require('../models/User');
const Job = require('../models/Job');

class UserController {
    // [GET] user/:slug
    show(req, res, next) {
        Job.find({userId: req.session.userId})
            .then((jobs) => {
                res.render('', {
                    jobs: mutipleMongooseToObject(jobs),
                });
            })
            .catch(err => next(err));
    }
    // [GET] user/:slug/edit
    showEdit(req, res, next) {
        User.findById(req.session.userId)
            .then((user) => {})
    }
}

module.exports = new UserController();
