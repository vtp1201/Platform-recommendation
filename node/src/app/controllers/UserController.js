const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const bcrypt = require('bcrypt');

class UserController {
    // [GET] user/home
    async show(req, res, next) {
        let user = await User.findOne({ _id: req.user._id });
        user.username = loggedName;
        Job.find({userId: req.user._id})
            .then((jobs) => {
                jobs = mutipleMongooseToObject(jobs);
                jobs.forEach((job) => job.createdAt = job.createdAt.toLocaleString("en-US"));
                res.render('user/home', {
                    jobs: jobs,
                    user: user,
                });
            })
            .catch(err => next(err));
    }
    // [GET] user/edit-profile
    showEdit(req, res, next) {
        User.findById(req.user._id)
            .then((user) => {
                user.username = loggedName;
                res.render('user/edit', {
                    user: user,
                    message: req.flash('message'),
                    messageType: req.flash('messageType'),
                })
            })
            .catch(next);
    }
    update(req, res, next) {
        if (req.body.password != req.body.re_password) {
            req.flash('messageType', 'danger');
            req.flash('message', "Those passwords didn't match. Try again.");
            res.redirect('back');
            return;
        }
        User.findById(req.user._id)
            .then((user) => {
                bcrypt.compare(req.body.old_password, user.password, (err, same) => {
                    if (!same) {
                        req.flash('messageType', 'danger');
                        req.flash('message', "Current password is wrong.");
                        res.redirect('back');
                        return;
                    }
                });
            }).then(()=> {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    req.body.password = hash;
                    User.findByIdAndUpdate(req.user._id, req.body)
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
                })
            }).catch(() => {
                req.flash('messageType', 'danger');
                req.flash('message', `Can't update, please try again later`);
                res.redirect('back');
            });
    }
}

module.exports = new UserController();
