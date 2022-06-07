const express = require('express');
const { checkNotLogged } = require('../app/middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');

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
router.get('/scenario/:id', checkNotLogged, jobController.showScenario);
router.post('/scenario/:id', checkNotLogged, jobController.createRecommendation);
router.get('/new-job', checkNotLogged, jobController.newJob);
router.post('/new-job', checkNotLogged, jobController.createNewJob);
router.get('/preview-data/:id', checkNotLogged, jobController.preview);
router.post('/check-unique/:id', checkNotLogged, jobController.checkUnique);
router.post('/add-query/:id', checkNotLogged, jobController.createNewQuery);
router.post('/add-file/:id', checkNotLogged, uploadMutiple, jobController.addFile);
router.delete('/:id', checkNotLogged, jobController.delete);
router.delete('/:id/destroy', checkNotLogged, jobController.destroy);
router.patch('/:id/restore', checkNotLogged, jobController.restore);
router.get('/trash', checkNotLogged, jobController.trash);
router.post('/api/extract', jobController.extract);
router.post('/api/update', jobController.updateData);
router.post('/api/update-data', jobController.updateDataByQuery);

module.exports = router;