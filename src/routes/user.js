const express = require('express');
const { checkNotLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();

const userController = require('../app/controllers/UserController');


module.exports = router;