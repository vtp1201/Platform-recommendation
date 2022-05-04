const Job = require('../models/Job');
const DataSource = require('../models/DataSource');
const fetch = require('cross-fetch');
const {connect, disconnect, query} = require('../../config/db/mssql');
const {testConnection, queryData} = require('../../config/db/mysql');

const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const uploadMutipleFiles = require('../../config/firebase/firebase');
const mongoose   = require('mongoose');
mongoose.Promise = Promise;
let db = mongoose.connection;

function check(dataSource, obj, toObj) {
    if(dataSource) {
        obj[toObj] = dataSource[0].firebaseUrl;
        return true;
    }
    return false;
}
class JobController {
    // [GET] job/managers
    showManager(req, res, next) {
        const perPage = 4;
        const page = parseInt(req.query.page) || 1;
        Job.find({userId: req.user._id , deleted: false})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec((err, jobs) => 
                Job.where({userId: req.user._id, deleted : false}).countDocuments ((err, count) => {
                if (err) return next(err);
                jobs = mutipleMongooseToObject(jobs);
                jobs.forEach((job) => job.createdAt = job.createdAt.toLocaleString("en-US"));
                res.render('job/manageJob', {
                    jobs: jobs,
                    current: page,
                    pages: Math.ceil(count / perPage),
                });
            }));
    }
    // [GET] job/detail/:id
    showJob(req, res, next) {
        Job.findById(req.params.id)
            .then( job => {
                job = mongooseToObject(Job(job));
                job.createdAt = job.createdAt.toLocaleString("en-US");
                if (job.userId != req.user._id) {
                    return res.render('notfound');
                }
                res.render('job/detail', {
                    job: job,
                })
            })
            .catch(next);
    }
    // [GET] job/new-job
    newJob(req, res, next) {
        res.render('job/newJob', {
            messageType: req.flash('messageType'),
            message: req.flash('message'),
        });
    }
    // [GET] job/scenario/:id
    async showScenario(req, res) {
        try {
            const job = await Job.findOne({
                _id: req.params.id,
                userId: req.user._id,
            }).populate('dataSource');
            
            if (job === null) {
                res.redirect('back');
                return;
            }
            const dataSource = job.dataSource;
            let dataObject = {};
            let dataKey = {};
            let dataRequest = {};

            if(dataSource.object) {
                dataObject = await preViewData(dataSource.object);
            }

            if(dataSource.key) {
                dataKey = await preViewData(dataSource.object);
            }

            if(dataSource.request) {
                dataRequest = await preViewData(dataSource.request);
            }
            //console.log(dataObject);

            job.createdAt = job.createdAt.toLocaleString("en-US");
            res.render('job/scenario', {
                messageType: req.flash('messageType'),
                message: req.flash('message'),
                job: job,
                dataSource: dataSource,
                dataObject: dataObject,
                dataKey: dataKey,
                dataRequest: dataRequest,
            });
        } catch (error) {
            console.log(error);
            res.redirect('back');
        } 
    }
    // [GET] job/preview-data/:id
    async preview(req, res, next) {
        try {
            const job = await Job.findOne({
                _id: req.params.id,
                userId: req.user._id,
            }).populate('dataSource');
            
            if (job === null) {
                res.redirect('back');
                return;
            }
            const dataSource = job.dataSource;
            let dataObject = {};
            let dataKey = {};
            let dataRequest = {};

            if(dataSource.object) {
                dataObject = await preViewData(dataSource.object);
            }

            if(dataSource.key) {
                dataKey = await preViewData(dataSource.object);
            }

            if(dataSource.request) {
                dataRequest = await preViewData(dataSource.request);
            }
            //console.log(dataObject);

            job.createdAt = job.createdAt.toLocaleString("en-US");
            res.render('job/previewData', {
                messageType: req.flash('messageType'),
                message: req.flash('message'),
                job: job,
                dataSource: dataSource,
                dataObject: dataObject,
                dataKey: dataKey,
                dataRequest: dataRequest,
            });
        } catch (error) {
            console.log(error);
            res.redirect('back');
        }    
    }
    // [POST] job/preview-data/:id
    async createNewQuery(req, res) {
        //console.log(req.body);
        try {
            const job = await Job.findOne({
                _id : req.params.id,
                userId: req.user._id
            }).populate('dataSource');

            const dataSource = job.dataSource;

            let server = 'server';
            if (dataSource.type == 'mysql') {
                server = 'host';
            } 

            const config = {
                database: dataSource.database,
                [server]: dataSource.server,
                user: dataSource.user,
                password: dataSource.password,
            }

            if (dataSource.port) {
                config.port = dataSource.port;
            }

            for (let key in req.body) {
                if (key == 'queryobject' || key == 'querykey' || key == 'queryrequest') {
                    let query = {
                        ...req.body[key],
                    };
                    let name = key.split('query')[1];
                    if (!query.select || !query.from || dataSource[name]) {
                        break;
                    }
                    let data = [];
                    if (dataSource.type == 'sqlS') {
                        data = await query(query);
                    } else if (dataSource.type == 'mysql') {
                        data = await queryData(config, query);
                    }
                    if ( data == false ) {
                        break;
                    }
                    const [addData, update] = await Promise.all([
                        addDataCollection(`data-${name}`, dataSource._id, data),
                        DataSource.updateOne(
                            { 
                                _id: dataSource._id,
                            }, {
                                [key] : query,
                                [name] : `${dataSource._id}-data-${name}`,
                            }
                        )
                    ]);
                }
            }
            res.redirect(`job/preview-data/${job._id}`);
        } catch (error) {
            console.log(error);
            req.flash('messageType', 'danger');
            req.flash('message', "Something went wrong. try again.");
            return res.redirect('back');
        }
    }
    // [POST] job/new-job
    async createNewJob(req, res) {
        try {
            if (req.body.dataSourceType != 'file') {
                const config = {
                    database: req.body.database,
                    host: req.body.server,
                    user: req.body.user,
                    password: req.body.password,
                    port: req.body.port == null ? undefined: Number(req.body.port)
                }
                let check = '';
                if (req.body.dataSourceType == 'sqlS') {
                    check = await connect(config);
                    await disconnect();
                } else if (req.body.dataSourceType == 'mysql') {
                    console.log("object");
                    check = await testConnection(config);
                    console.log(check)
                }
                if (check === false) {
                    req.flash('messageType', 'danger');
                    req.flash('message', "Please check dataSource and try again.");
                    return res.redirect('back');
                }
            }
            const newJob = new Job({
                ...req.body,
                userId : req.user._id,
            });
            const job = await newJob.save();
            const newDataSource = new DataSource({
                jobId: job._id,
                type: req.body.dataSourceType,
                ...req.body,
            })
            const dataSource = await newDataSource.save();
            await Job.updateOne({ _id: job._id}, {
                dataSource: dataSource._id,
            });
            return res.redirect(`/job/preview-data/${job._id}`);
        } catch (error) {
            console.log(error);
            req.flash('messageType', 'danger');
            req.flash('message', "Something went wrong. try again.");
            return res.redirect('back');
        }
        
    }
    // [POST] job/add-file/:id
    async addFile(req, res) {
        try {
            const job = await Job.findById(req.params.id);
            await uploadMutipleFiles(req, res, next);
            const jobApi = {}
            check(req.files.dataSourceObject, jobApi, 'dataSourceObject');
            check(req.files.dataSourceKey, jobApi, 'dataSourceKey');
            check(req.files.dataSourceRequest, jobApi, 'dataSourceRequest');
            const pyHost = process.env.PYTHON_HOST || '127.0.0.1';
            const pyPort = process.env.PYTHON_PORT || 8000;
            const url = `http://${pyHost}:${pyPort}/api/addfile`;
            fetch(url, {
                method: 'POST',
                body: JSON.stringify(jobApi),
                headers: { 'Content-Type': 'application/json' }
            })
            .then( res => res.json())
            .then( async json => {
                if(json.message != 'Done') {
                    req.flash('messageType', 'danger');
                    req.flash('message', json.message + ", Try again.");
                    return res.redirect('back');
                }
                const update = {};
                if (check(req.files.dataSourceObject, update.location, 'object') == true) {
                    update.name.object = req.files.dataSourceObject[0].originalname;
                }
                if (check(req.files.dataSourceObject, update.location, 'key') == true) {
                    update.name.key = req.files.dataSourceObject[0].originalname;
                }
                if (check(req.files.dataSourceRequest, update.location, 'request') == true) {
                    update.name.request = req.files.dataSourceRequest[0].originalname;
                }
                const result = await DataSource.updateOne({_id : job.dataSource}, update);
                console.log(result);
                const dataSource = await DataSource.findOne({_id : job.dataSource});
                const keys = Object.keys(dataSource);
                keys.forEach(key => {
                    if (key == 'key' || key == 'object' || key == 'request') {
                        renameCollection(key, dataSource._id);
                    }       
                });
                //renameCollection('recommends', job._id);
                return res.redirect(`/job/preview-data/${job._id}`);
            })
            .catch( error => {
                console.log(error);
                req.flash('messageType', 'danger');
                req.flash('message', "can't create. Try again.");
                return res.redirect('back');
            })
        } catch (error) {
            req.flash('messageType', 'danger');
            req.flash('message', "can't add file. Try again.");
            return res.redirect('back');
        }
    }
    // [POST] job/new-job
    create (req, res, next) {
        uploadMutipleFiles(req, res, next)
        .then((a) => {
            const jobApi = {
                service: req.body.service,
                object: req.body.object,
                key: req.body.key,
                request: req.body.request,
            };
            if (!req.files.dataSourceKey) {
                req.flash('messageType', 'danger');
                req.flash('message', "please enter interactions files. Try again.");
                return res.redirect('back');
            }
            else {
                jobApi.dataSourceKey = req.files.dataSourceKey[0].firebaseUrl;
            }
            check(req.files.dataSourceObject, jobApi, 'dataSourceObject');
            check(req.files.dataSourceRequest, jobApi, 'dataSourceRequest');
            try {
                const pyHost = process.env.PYTHON_HOST || '127.0.0.1';
                const pyPort = process.env.PYTHON_PORT || 8000;
                const url = `http://${pyHost}:${pyPort}/api/recommend`;
                console.log(url);
                fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(jobApi),
                    headers: { 'Content-Type': 'application/json' }
                })
                .then( res => res.json())
                .then( json => {
                    if(json.message != 'Done') {
                        req.flash('messageType', 'danger');
                        req.flash('message', json.message + ", Try again.");
                        return res.redirect('back');
                    }
                    const newJob = {
                        userId: req.user._id,
                        title: req.body.title,
                        description: req.body.description,
                        service: req.body.service,
                        object: req.body.object,
                        key: req.body.key,
                        request: req.body.request,
                        dataSource: { 
                            key: req.files.dataSourceKey[0].originalname,
                        },
                        DSLocation: { 
                            key: req.files.dataSourceKey[0].firebaseUrl,
                        },
                        dataDestination: json.dataDestination,
                        DDLocation: json.DDLocation
                    }
                    if (check(req.files.dataSourceObject, newJob.DSLocation, 'object') == true) {
                        newJob.dataSource.object = req.files.dataSourceObject[0].originalname;
                    }
                    if (check(req.files.dataSourceRequest, newJob.DSLocation, 'request') == true) {
                        newJob.dataSource.request = req.files.dataSourceRequest[0].originalname;
                    }
                    const job = new Job(newJob);
                    job.save()
                    .then( job => {
                        const keys = Object.keys(newJob.dataSource);
                        keys.forEach(key => {
                            if (key == 'key' || key == 'object' || key == 'request') {
                                renameCollection(key, job._id);
                            }       
                        });
                        renameCollection('recommends', job._id);
                        return res.redirect(`/job/detail/${job._id}`);
                    })
                    .catch(error => {
                        console.log(error);
                        req.flash('messageType', 'danger');
                        req.flash('message', "can't save Job. Try again.");
                        return res.redirect('back');
                    })
                })
                .catch( error => {
                    console.log(error);
                    req.flash('messageType', 'danger');
                    req.flash('message', "can't create. Try again.");
                    return res.redirect('back');
                })
            } catch (error) {
                req.flash('messageType', 'danger');
                req.flash('message', "server down. Try again later!");
                return res.redirect('back');
            }
        }).catch(error => {
            req.flash('messageType', 'danger');
            req.flash('message', "can't create(bad request). Try again.");
            return res.redirect('back');
        })
    }
    // [GET] job/trash
    trash(req, res, next) {
        const perPage = 4;
        const page = parseInt(req.query.page) || 1;
        Job.findDeleted({userId: req.user._id})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec((err, jobs) => 
                Job.countDocumentsDeleted (({userId: req.user._id}), (err, count) => {
                if (err) return next(err);
                jobs = mutipleMongooseToObject(jobs);
                jobs.forEach((job) => {
                    job.createdAt = job.createdAt.toLocaleString("en-US");
                    job.deletedAt = job.deletedAt.toLocaleString("en-US");
                });
                res.render('job/trash', {
                    jobs: jobs,
                    current: page,
                    pages: Math.ceil(count / perPage),
                });
            }));
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
            .then(() => {
                const request = dropCollection(`${req.params.id}-request`);
                const object = dropCollection(`${req.params.id}-object`);
                const key = dropCollection(`${req.params.id}-key`);
                const recommends = dropCollection(`${req.params.id}-recommends`);
                Promise.all([request, object, key, recommends])
                .finally(() => {
                    res.redirect('back');
                });
            })
            .catch(next);
    }
    // [PATCH] job/:id/restore
    restore(req, res, next) {
        Job.restore({ _id : req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
    // [POST] job/api/extract
    extract(req, res) {
        if (req.body.object === undefined || req.body.jobId === undefined) {
            res.status(500).json({
                message: "jobId or object is undefined!"
            });
            return;
        }
        Job.findOne({ _id : req.body.jobId, deleted : false})
            .then(async job => {
                if (job == null) {
                    res.status(401).json({
                        message: "jobId does not exist!"
                    });
                    return;
                }
                db.collection(`${job._id}-recommends`).find({}, { projection: { _id: 0 } }).toArray(function(err, result) {
                    if (err) {
                        res.status(400).json({
                            message: "jobId does not have recommends-data!"
                        });
                        return;
                    }
                    if (result.length == 0) {
                        res.status(400).json({
                            message: "jobId does not have recommends-data!"
                        });
                        return;
                    }
                    const key = Object.keys(result[0]);
                    const personId = key[0];
                    function isUser(Id) {
                        return Id[`${personId}`] == req.body.object;
                    }
                    
                    const dt = result.find(isUser)
                    if (dt === undefined) {
                        res.status(400).json({
                            message: "userId does not exist!"
                        });
                        return;
                    }
                    const df = dt.recommends.map(data => {
                        if (typeof data === "object") {
                            return data.high * Math.pow(2,32) + data.low
                        }
                        return data;
                    });
                    if (req.body.limits === undefined || Number.isInteger(req.body.limits) === false) {
                        res.status(200).json(df)
                        return;
                    }
                    res.status(200).json(df.slice(0,req.body.limits));
                });
            })
            .catch(err => {
                res.status(401).json({
                    message: "jobId does not exist!"
                });
                return;
            })
    }
    // POST /job/api/update
    updateData(req, res) {
        if (!req.body.jobId) {
            return res.status(401).json({
                message: "add jobId"
            });
        }
        Job.findOne({ _id : req.body.jobId, deleted : false })
            .then(async (job) => {
                if (job == null) {
                    res.status(401).json({
                        message: "jobId does not exist!"
                    });
                    return;
                }
                const keys = Object.keys(req.body);
                addMany(keys, job._id, req.body)
                .then((message) => {
                    message.message = "Done";
                    if(req.body.newRecommends || req.body.newRecommends === true) {
                        const jobApi = {
                            jobId: job._id,
                            service: job.service,
                            object: job.object,
                            key: job.key,
                            request: job.request,
                        }
                        const pyHost = process.env.PYTHON_HOST || '127.0.0.1';
                        const pyPort = process.env.PYTHON_PORT || 8000;
                        const url = `http://${pyHost}:${pyPort}/api/update-recommend`;
                        try {
                            fetch(url, { 
                                method: 'POST',
                                body: JSON.stringify(jobApi),
                                headers: { 'Content-Type': 'application/json' }
                            })
                            .then( res => res.json())
                            .then( json => {
                                if(json.message == 'Done') {
                                    message[`newRecommends`] = 'update success';
                                } else {
                                    message[`newRecommends`] = 'update failed';
                                }
                            })
                            .catch( error => {
                                message[`newRecommends`] = 'server failed';
                            })
                            .finally(() => {
                                return res.status(200).json(message);
                            })
                        } catch (error) {
                            message[`newRecommends`] = 'server down, Please try later!';
                            res.status(200).json(message);
                            return;
                        }
                    } else {
                        res.status(200).json(message);
                        return;
                    }
                }).catch((err) => {
                    console.log(err);
                    res.status(400).json({
                        message: "bad request"
                    });
                    return;
                })
            }).catch(err => {
                console.log(err)
                res.status(401).json({
                    message: "jobId does not exist!"
                });
                return;
            })
    }
}

async function renameCollection(name, jobId) {
    const listCollections = await db.db.listCollections().toArray();
    listCollections.forEach( collection => {
        if (collection.name == `${name}`) {
            db.collection(name).rename(`${jobId}-${name}`);
            return true;
        }
    });
    return false;
}

function addDataCollection(name, jobId, data) {
    return new Promise(async (resolve, reject) => {
        const listCollections = await db.db.listCollections().toArray();
        const collections = (collection) => collection.name == `${jobId}-${name}`;
        if (listCollections.some(collections) == true) {
            db.db.collection(`${jobId}-data-${name}`).insertMany(data, function(error, record){
                if (error) {
                    console.log(error);
                    return reject('error');
                }
                return resolve('done');
            });
        }
        else {
            db.db.createCollection(`${jobId}-${name}`)
            .then(collection => {
                db.db.collection(`${jobId}-${name}`).insertMany(data, function(error, record){
                    if (error) {
                        console.log(error);
                        return reject('error');
                    }
                    return resolve('done');
                });
            }). catch(err => {
                console.log(error);
                return reject('error');
            });
        }
        
    });
}

async function preViewData(collection) {
    try {
        let [count, data] = await Promise.all([
            db.db.collection(collection).countDocuments(),
            db.db.collection(collection).find({},{
                _id: false,
            }).limit(20).toArray()
        ]);

        let current = 20 ;
        if (count <= 20 ) {
            current = count;
        }

        data = data.map(data => {
            if (data._id) {
                delete data._id
            }
            return data;
        })

        return { 
            count, 
            current, 
            data
        }
    } catch (error) {
        console.log(error);
        return {};
    }
}

function addMany(keys, jobId, data) {
    return new Promise((resolve) => {
        const message = {}
        let requests = keys.map((key) => {
            return new Promise((resolve) => {
                if (key == 'key' || key == 'request' || key == 'object') {
                    addDataCollection(key, jobId, data[key])
                    .then(() => {
                        message[`data-${key}`] = "update success";
                        resolve();
                    }).catch((err) => {
                        console.log(err);
                        message[`data-${key}`] = "update failed";
                        resolve();
                    });
                }
                else{  
                    resolve();
                }
            });
        })
        Promise.all(requests).then(() => resolve(message));
    })
}

function dropCollection(name) {
    return new Promise(async (resolve, reject) => {
        const listCollections = await db.db.listCollections().toArray();
        const collections = (collection) => collection.name == `${name}`;
        if (listCollections.some(collections) == true) {
            db.db.collection(name).drop(function (err, delOk) {
                if (err) return reject('error');
                return resolve();
            })
        } else return resolve();
    })
}

module.exports = new JobController();
