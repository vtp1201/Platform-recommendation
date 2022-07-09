const bcrypt = require('bcrypt');
const User = require('../models/User');

class AuthController {
    // [GET] auth/sign-in
    signIn (req, res, next) {
        res.render('user/signin', { 
            message: req.flash('message'), 
        });
    }
    // [GET] auth/sign-up
    signUp (req, res, next) {
        res.render('user/signup', { 
            messageType: (req.flash('messageType')).toString(),
            message: (req.flash('message')).toString()
        });
    }
    // [GET] auth/forgot-password
    showForgotPassword(req, res) {
        res.render('user/forgotPassword', { 
            messageType: (req.flash('messageType')).toString(),
            message: (req.flash('message')).toString()
        });
    }
    // [POST] auth/forgot-password
    async ForgotPassword(req, res) {
        const user = await User.findOne({ 
            'local.username': req.body.username,
        })
        if (!user) {
            req.flash('messageType', 'danger');
            req.flash('message', "Can't find account.");
            res.redirect('back');
            return;
        }
        if(!user.local.lastPassword.includes(req.body.password)) {
            let isCompare = false;
            bcrypt.compare(req.body.password, user.local.password, (err, same) => {
                if (same) {
                    isCompare = true;
                    return;
            }})
            if (isCompare === true) {
                req.flash('messageType', 'success');
                req.flash('message', 'Your password already right');
                return res.redirect('back');
            }
            req.flash('messageType', 'danger');
            req.flash('message', "Can't find old password.");
            res.redirect('back');
            return;
        }
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            req.body.password = hash;
            const local = {
                ...user.local,
                password: req.body.password,
            }
            User.updateOne({ 
                'local.username': req.body.username,
            }, {
                local
            })
            .then(() => {
                req.flash('messageType', 'success');
                req.flash('message', 'update password complete');
                res.redirect('back');
            })
            .catch(() => {
                req.flash('messageType', 'danger');
                req.flash('message', `Can't update, please try again later`);
                res.redirect('back');
            });
        })
    }
    // [POST] auth/sign-in
    signInUser (req, res, next) {
        const { username, password } = req.body;
        User.findOne({username: username})
            .then( user => {
                bcrypt.compare(password, user.password, (err, same) => {
                    if (same) {
                        req.session.userId = user._id;
                        req.session.username = user.username;
                        req.flash('message', 'Sign in successfully');
                        res.redirect('/');
                        return;
                    }
                    req.flash('message', 'Invalid username or password.');
                    res.redirect('back',);
                }
                )})
            .catch(err => {
                req.flash('message', 'Invalid username or password.');
                res.redirect('back');
            });
    }
    // [POST] auth/sign-up
    signUpUser (req, res, next) {
        if (req.body.password != req.body.re_password) {
            req.flash('messageType', 'danger');
            req.flash('message', "Those passwords didn't match. Try again.");
            res.redirect('back');
            return;
        }
        const user = new User(req.body);
        user
            .save()
            .then(() => {
                req.flash('messageType', 'success');
                req.flash('message', 'Sign up successfully');
                res.redirect('back');
                return;
            })
            .catch(err => {
                req.flash('messageType', 'danger');
                req.flash('message', 'Username has already been taken. Try again');
                res.redirect('back');
                return;
            }
            );
    }
    // [GET] auth/sign-out
    logOut (req, res, next) {
        req.logout();
        res.redirect('/');
    }
}

module.exports = new AuthController();
