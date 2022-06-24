const express = require('express');
const { checkNotLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();

const userController = require('../app/controllers/UserController');

router.get('/home', checkNotLogged, userController.show);
router.get('/edit-profile', checkNotLogged, userController.showEdit);
router.put('/edit-profile', checkNotLogged, userController.update);
router.put('/gen-key', checkNotLogged, userController.updateKey);

module.exports = router;