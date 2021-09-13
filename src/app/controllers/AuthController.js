const bcrypt = require('bcrypt');
const { mongooseToObject } = require('../../util/mongoose');
const User = require('../models/User');

class AuthController {
    // [GET] auth/sign-in
    signIn (req, res, next) {
        res.render('user/signin');
    }
    // [GET] auth/sign-up
    signUp (req, res, next) {
        res.render('user/signup')
    }
    // [POST] auth/
    signInNow (req, res, next) {
        res.render('user/signin', {
            user: mongooseToObject(req.body)
        });
    }
    // [POST] auth/sign-in
    signInUser (req, res, next) {
        const { username, password } = req.body;
        User.findOne({username: username}, (err, user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, same) => {
                    if (same) {
                        req.session.userId = user._id;
                        res.redirect('/');
                        return;
                    }
                    res.redirect('back');
                });
                return;  
            }
            res.redirect('back');       
        });
    }
    // [POST] auth/sign-up
    signUpUser (req, res, next) {
        const user = new User(req.body);
        user
            .save()
            .then(() => res.redirect('back'))
            .catch(err => res.redirect('back'));
    }
    // [GET] auth/logout
    logOut (req, res, next) {
        req.session.destroy(() => res.redirect('/'));
    }
}

module.exports = new AuthController();
