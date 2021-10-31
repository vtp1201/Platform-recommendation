const Job = require('../models/Job');
const User = require('../models/User');
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');

class JobController {
    // [GET] job/
    showManager(req, res, next) {
        Job.find({userId: req.session.userId})
            .then( jobs => res.render('job/manageJob', {
                    jobs: mutipleMongooseToObject(jobs),
                })
            )
            .catch(next);
    }
    // [GET] job/:id
    showJob(req, res, next) {
        Job.findById(req.params.id)
            .then( job => res.render('job/detail', {
                job: mongooseToObject(job),
            }))
            .catch(next);
    }
    // [GET] job/new-job
    newJob(req, res, next) {
        res.render('job/newJob', {
            messageType: req.flash('messageType'),
            message: req.flash('message'),
        });
    }
    // [POST] job/new-job
    create(req, res, next) {
        req.body.userId = req.session.userId;
        const job = new Job(req.body);
        job.save()
            .then( job => {
                res.redirect(`job/${job._id}`);
            })
            .catch(err => {
                req.flash('messageType', 'danger');
                req.flash('message', "can't create. Try again.");
                res.redirect('back');
            })
    }
    // [DELETE] job/:id
    delete(req, res, next) {
        Job.delete({ _id : req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // [DELETE] job/:id/destroy
    destroy(req, res, next) {
        Job.deleteOne({ _id : req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // [PATCH] job/:id/restore
    restore(req, res, next) {
        Job.restore({ _id : req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
}

module.exports = new JobController();
