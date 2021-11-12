const Job = require('../models/Job');
const fetch = require('cross-fetch');
const multer = require("multer");
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');


class JobController {
    // [GET] job/managers
    showManager(req, res, next) {
        Job.find({userId: req.session.userId})
            .then( jobs => res.render('job/manageJob', {
                    jobs: mutipleMongooseToObject(jobs),
                })
            )
            .catch(next);
    }
    // [GET] job/detail/:id
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
    async create(req, res, next) {
        const upload = multer({
            storage: multer.diskStorage({
                        destination: "../../public/uploads",  // Storage location
                        filename: (req, res, (cb) => {
                                cb(null, Date.now() + path.extname(file.originalname))
                                // return a unique file name for every file             
                        })
                }),
            limits: {fileSize: 2000000000},
            // This limits file size to 2 million bytes(2mb)    fileFilter: 
            fileFilter: (req, file, cb) => {
                // Create regex to match jpg and png
                const validFileTypes = /csv|xlsx|json/
        
                // Do the regex match to check if file extenxion match
                const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
                    if(mimetype && extname){
                        // Return true and file is saved
                return cb(null, true)
            }else{
                        // Return error message if file extension does not match
               return cb("Error: Images Only!")
            }
        }
        }).single("dataSource");
        upload(req, res, (err) => {
            if(err){
                res.send(err)
                // This will display the error message to the user
            }
        })
        req.body.userId = req.session.userId;
        if ( req.file) {
            console.log(req.file);
        }
        //req.body.DSLocation = req.file.path.split('/').slice(1).join('/');
        const jobApi = {
            service: req.body.service,
            object: req.body.object,
            key: req.body.key,
            request: req.body.request,
            dataSource: req.body.dataSource,
        }
        await fetch('http://127.0.0.1:8000/api/recommend', {
            method: 'POST',
            body: JSON.stringify(jobApi),
        })
            .then( res => res.json())
            .then( json => {
                req.body.dataDestination = json.dataDestination;
                req.body.DDLocation = json.DDLocation;
            })
            .catch( err => {
                req.flash('messageType', 'danger');
                req.flash('message', "can't create. Try again.");
                res.redirect('back');
                return;
            })
        const job = new Job(req.body);
        job.save()
            .then( job => {
                res.redirect(`/job/detail/${job._id}`);
            })
            .catch(err => {
                req.flash('messageType', 'danger');
                req.flash('message', "can't create. Try again.");
                res.redirect('back');
            })
    }
    // [GET] job/trash
    trash(req, res, next) {
        Job.findDeleted({userId: req.session.userId})
            .then(jobs => 
                res.render('job/trash', {
                    jobs: mutipleMongooseToObject(jobs),
                }),
            )
            .catch(next);
    }
    // [DELETE] job/:id
    delete(req, res, next) {
        Job.delete({ _id : req.params.id })
            .then(() => res.redirect('/job/managers'))
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
