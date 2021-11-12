const express = require('express');
const { checkNotLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();

const jobController = require('../app/controllers/JobController');

router.get('/managers', checkNotLogged, jobController.showManager);
router.get('/detail/:id', checkNotLogged, jobController.showJob);
router.get('/new-job', checkNotLogged, jobController.newJob);
router.post('/new-job', checkNotLogged, jobController.create);
router.delete('/:id', checkNotLogged, jobController.delete);
router.delete('/:id/destroy', checkNotLogged, jobController.destroy);
router.patch('/:id/restore', checkNotLogged, jobController.restore);
router.get('/trash', checkNotLogged, jobController.trash);

module.exports = router;