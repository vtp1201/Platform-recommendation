const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const User = require('../models/User');
const Job = require('../models/Job');

class UserController {
    // [GET] user/home
    async show(req, res, next) {
        const user = await User.findOne({ slug: req.params.slug });
        Job.find({userId: req.session.userId})
            .then((jobs) => {
                res.render('user/home', {
                    jobs: mutipleMongooseToObject(jobs),
                    user: mongooseToObject(user),
                });
            })
            .catch(err => next(err));
    }
    // [GET] user/edit-profile
    showEdit(req, res, next) {
        User.findById(req.session.userId)
            .then((user) => {
                res.render('user/edit', {
                    user: mongooseToObject(user),
                    message: req.flash('message'),
                    messageType: req.flash('messageType'),
                })
            })
            .catch(next);
    }
    // [PUT] user/edit-profile
    update(req, res, next) {
        User.findByIdAndUpdate(req.session.userId, req.body)
            .then(() => {
                req.flash('messageType', 'success');
                req.flash('message', 'update complete');
                res.redirect('back');
            })
            .catch(() => {
                req.flash('messageType', 'danger');
                req.flash('message', `Can't update, please try again later`);
                res.redirect('back');
            });
    }
}

module.exports = new UserController();
