const express = require('express');
const { checkLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();

const authController = require('../app/controllers/AuthController');

router.get('/sign-in', checkLogged, authController.signIn);
router.get('/sign-up', checkLogged, authController.signUp);
router.post('/sign-in', checkLogged, authController.signInUser);
router.post('/sign-up', checkLogged, authController.signUpUser);
router.get('/sign-out', authController.logOut);

router.get('/facebook', checkLogged, 
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

module.exports = router;
