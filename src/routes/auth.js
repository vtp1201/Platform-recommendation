const express = require('express');
const router = express.Router();

const authController = require('../app/controllers/AuthController');

router.get('/sign-in', authController.signIn);
router.get('/sign-up', authController.signUp);
router.post('/sign-ip', authController.signInUser);
router.post('/sign-up', authController.signUpUser);

module.exports = router;
