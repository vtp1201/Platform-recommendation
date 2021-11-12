const express = require('express');
const { checkLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();

const authController = require('../app/controllers/AuthController');

router.get('/sign-in', checkLogged, authController.signIn);
router.get('/sign-up', checkLogged, authController.signUp);
router.post('/sign-in', checkLogged, authController.signInUser);
router.post('/sign-up', checkLogged, authController.signUpUser);
router.get('/sign-out', authController.logOut);

module.exports = router;
