module.exports = function(passport){
    const express = require('express');
    const { checkLogged } = require('../app/middleware/authMiddleware');
    const router = express.Router();

    const authController = require('../app/controllers/AuthController');

    router.get('/sign-in', checkLogged, authController.signIn);
    router.get('/sign-up', checkLogged, authController.signUp);

    router.get('/forgot-password', checkLogged, authController.showForgotPassword);
    router.post('/forgot-password', checkLogged, authController.ForgotPassword);

    router.post('/sign-in', checkLogged, passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/auth/sign-in', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    router.post('/sign-up', checkLogged, passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/auth/sign-up',
        failureFlash : true,
    }));
    router.get('/sign-out', authController.logOut);

    router.get('/facebook', 
        passport.authenticate('facebook', { scope : ['public_profile', 'email']})
    );
    router.get('/facebook/callback', checkLogged,
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/auth/sign-up'
        })
    );

    router.get('/google', checkLogged,
        passport.authenticate('google', { scope : ['profile', 'email'] })
    );
    router.get('/google/callback', checkLogged,
        passport.authenticate('google', {
            successRedirect : '/',
            failureRedirect : '/auth/sign-up'
        })
    );

    router.get('/twitter', checkLogged,
        passport.authorize('twitter', { scope : 'email' })
    );
    router.get('/twitter/callback', checkLogged,
        passport.authorize('twitter', {
            successRedirect : '/',
            failureRedirect : '/auth/sign-up'
        })
    );
    return router;
};



