const express = require('express');
const { checkNotLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const uploadMutipleFiles = require('../config/firebase/firebase');

const upload = multer({
    storage: multer.memoryStorage()
})

const uploadMutiple = upload.fields(
    [
        { name: 'dataSourceObject', maxCount: 1 },
        { name: 'dataSourceKey', maxCount: 1 },
        { name: 'dataSourceRequest', maxCount: 1 }
    ]
);

const jobController = require('../app/controllers/JobController');

router.get('/managers', checkNotLogged, jobController.showManager);
router.get('/detail/:id', checkNotLogged, jobController.showJob);
router.get('/new-job', checkNotLogged, jobController.newJob);
router.post('/new-job', checkNotLogged, uploadMutiple, uploadMutipleFiles, jobController.create);
router.delete('/:id', checkNotLogged, jobController.delete);
router.delete('/:id/destroy', checkNotLogged, jobController.destroy);
router.patch('/:id/restore', checkNotLogged, jobController.restore);
router.get('/trash', checkNotLogged, jobController.trash);
router.post('/api/extract', jobController.extract);

module.exports = router;