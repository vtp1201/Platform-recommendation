const express = require('express');
const { checkNotLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();

const jobController = require('../app/controllers/JobController');

router.get('/', checkNotLogged, jobController.showManager);
router.get('/:id', checkNotLogged, jobController.showJob);
router.get('/new-job', checkNotLogged, jobController.newJob);
router.post('/new-job', checkNotLogged, jobController.create);
router.delete('/:id', checkNotLogged, jobController.delete);
router.delete('/:id/destroy', checkNotLogged, jobController.destroy);
router.patch('/:id/restore', checkNotLogged, jobController.restore);

module.exports = router;