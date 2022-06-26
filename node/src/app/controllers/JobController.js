const Job = require('../models/Job');
const DataSource = require('../models/DataSource');
const Connection = require('../models/Connection');
const Query = require('../models/Query');
const Files = require('../models/File');

const { STATUS_JOB } = require('../../util/constants')

const fetch = require('cross-fetch');
const {connect, disconnect, query} = require('../../config/db/mssql');
const {testConnection, queryData, getDataByQuery} = require('../../config/db/mysql');
const {testConnectionPG, queryDataPG} = require('../../config/db/postgressql');

const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const uploadMutipleFiles = require('../../config/firebase/firebase');
const mongoose   = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.Promise = Promise;
let db = mongoose.connection;

const pyHost = process.env.PYTHON_HOST || 'localhost';
const pyPort = process.env.PYTHON_PORT || 8000;

function check(dataSource, obj, toObj) {
    if(dataSource) {
        if (!obj) {
            obj = {[toObj]: null};
        }
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
    async showJob(req, res, next) {
        try {
            const job = await Job.findOne({
                _id: req.params.id,
                userId: req.user._id,
            });
            
            if (job === null) {
                res.redirect('back');
                return;
            }

            const dataSource = await DataSource.findOne({
                _id: job.dataSource,
            }).populate([
                'queryObject', 'queryKey', 'queryRequest'
                , 'fileObject', 'fileKey', 'fileRequest'
            ]);

            if (!dataSource?.key && !dataSource?.request) {
                res.redirect(`/job/preview-data/${job._id}`);
                return;
            }
            
            let dataObject = {};
            let dataKey = {};
            let dataRequest = {};
            let dataRecommend = {};
            let files = {};
            let query = {};

            if(dataSource.object) {
                dataObject = await preViewData(dataSource.object, 300);
                files.object = dataSource?.fileObject;
                query.object = dataSource?.queryObject;
            }

            if(dataSource.key) {
                dataKey = await preViewData(dataSource.key, 300);
                files.key = dataSource?.fileKey;
                query.key = dataSource?.queryKey;
            }

            if(dataSource.request) {
                dataRequest = await preViewData(dataSource.request, 300);
                files.request = dataSource?.fileRequest;
                query.request = dataSource?.queryRequest;
            }

            if(job.dataDestination) {
                dataRecommend = await preViewData(job.dataDestination, 300);
            }
            //console.log(dataSource);

            job.createdAt = job.createdAt.toLocaleString("en-US");
            res.render('job/detail', {
                messageType: req.flash('messageType'),
                message: req.flash('message'),
                job: job,
                dataSource: dataSource,
                dataObject,
                dataKey,
                dataRequest,
                dataRecommend,
                files,
                query,
            });
        } catch (error) {
            console.log(error);
            res.redirect('back');
        } 
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
            });
            const dataSource = await DataSource.findOne({
                _id: job.dataSource,
            }).populate([
                'queryObject', 'queryKey', 'queryRequest'
                , 'fileObject', 'fileKey', 'fileRequest'
            ]);
            if (job === null) {
                res.redirect('back');
                return;
            }
            if (!dataSource.key && !dataSource.request) {
                res.redirect(`/job/preview-data/${job._id}`);
                return;
            }
            
            let dataObject = {};
            let dataKey = {};
            let dataRequest = {};

            if(dataSource.object) {
                dataObject = await preViewData(dataSource.object);
                dataObject.unique = dataSource?.queryObject?.unique || [];
            }

            if(dataSource.key) {
                dataKey = await preViewData(dataSource.key);
                dataKey.unique = dataSource?.queryKey?.unique || [];
            }

            if(dataSource.request) {
                dataRequest = await preViewData(dataSource.request);
                dataRequest.unique = dataSource?.queryRequest?.unique || [];
            }
            //console.log(dataSource);

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
            });
            
            if (job === null) {
                res.redirect('back');
                return;
            }
            const dataSource = await DataSource.findOne({
                _id: job.dataSource
            }).populate([
                'queryObject', 'queryKey', 'queryRequest'
                , 'fileObject', 'fileKey', 'fileRequest'
            ]);
            let dataObject = {};
            let dataKey = {};
            let dataRequest = {};
            let files = {};
            let query = {};

            if(dataSource.object) {
                dataObject = await preViewData(dataSource.object);
                files.object = dataSource?.fileObject;
                query.object = dataSource?.queryObject;
            }

            if(dataSource.key) {
                dataKey = await preViewData(dataSource.key);
                files.key = dataSource?.fileKey;
                query.key = dataSource?.queryKey;
            }

            if(dataSource.request) {
                dataRequest = await preViewData(dataSource.request);
                files.request = dataSource?.fileRequest;
                query.request = dataSource?.queryRequest;
            }
            //console.log(dataObject);

            // job.createdAt = job.createdAt.toLocaleString("en-US");
            res.render('job/previewData', {
                messageType: req.flash('messageType'),
                message: req.flash('message'),
                job,
                dataSource,
                dataObject,
                dataKey,
                dataRequest,
                files,
                query,
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

            const dataSource = await DataSource.findOne({
                _id : job.dataSource
            }).populate('connection');

            const connection = dataSource.connection;

            let server = 'server';
            if (dataSource.type == 'mysql') {
                server = 'host';
            } 

            const config = {
                database: connection.database,
                [server]: connection.server,
                user: connection.user,
                password: connection.password,
            }

            if (connection.port) {
                config.port = connection.port;
            }

            for (let key in req.body) {
                if (key == 'queryObject' || key == 'queryKey' || key == 'queryRequest') {
                    let query = {
                        ...req.body[key],
                    };
                    let name = key.split('query')[1];
                    if (!query.select || !query.from || dataSource[name.toLowerCase()]) {
                        continue;
                    }
                    let data = [];
                    if (dataSource.type == 'sqlS') {
                        data = await query(query);
                    } else if (dataSource.type == 'mysql') {
                        data = await queryData(config, query);
                    } else if (dataSource.type == 'postgressql') {
                        data = await queryDataPG(config, query);
                    }
                    if ( data == false ) {
                        break;
                    }
                    const newQuery = new Query({
                        dataSourceId: dataSource._id,
                        data: `${dataSource._id}-${name.toLowerCase()}`,
                        category: name.toLowerCase(),
                        ...query,
                    })

                    const querySuccess = await newQuery.save(); 
                    
                    const [addData, update] = await Promise.all([
                        addDataCollection(name.toLowerCase(), dataSource._id, data),
                        DataSource.updateOne(
                            { 
                                _id: dataSource._id,
                            }, {
                                [key] : querySuccess._id,
                                [name.toLowerCase()] : `${dataSource._id}-${name.toLowerCase()}`,
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
    // [POST] check-unique/:id
    async checkUnique(req, res) {
        try {
            const { unique, target, autoUpdate} = req.body;
            const job = await Job.findOne({_id: req.params.id});
            const dataSource = await DataSource.findOne({
                _id: job.dataSource,
            }).populate([
                'queryObject', 'queryKey', 'queryRequest'
            ])

            if (!dataSource || dataSource.type == 'file' 
                || !dataSource.queryKey ||  !dataSource.queryRequest
            ) {
                return res.status(200).json({
                    message: 'Cant not check unique for this job',
                    type: 'danger'
                });
            }
            const name = target.toLowerCase();
            const collection = dataSource[`${name}`];
            const { data } = await preViewData(collection, 'full');
            let isUnique = [];
            if (unique.length == 1) {
                const newData = data.map(i => i[unique[0]]);
                if (hasNotDuplicatesArray(newData) === true) {
                    isUnique.push(unique[0]);
                }
            } else {
                unique.every( item => {
                    if (!data[0][item]) {
                        isUnique = [];
                        return false;
                    }
                    return true;
                })
                const newData = data.map(item => {
                    let string = `${item[unique[0]]}`
                    for (let index = 1; index < unique.length; index++) {
                        string = `${string}__${item[unique[index]]}__`;
                    }
                    return string;
                })
                if (hasNotDuplicatesArray(newData) === true) {
                    isUnique = [...unique];
                }
            }
            if (isUnique.length > 0) {
                await Query.updateOne({
                    _id: dataSource[`query${target}`]._id
                },{
                    unique: isUnique,
                    autoUpdate,
                })
                return res.status(200).json({
                    message: 'OK',
                })
            }
            return res.status(200).json({
                message: 'Columns not unique. Please try another columns!',
                type: 'danger'
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                message: 'Something went wrong. Try later!',
                type: 'danger'
            });
        }
    }
    // service schedule
    async updateDataSchedule(query) {
        try {
            const dataSource = await DataSource.findOne({
                _id : ObjectId(query.dataSourceId),
            }).populate('connection');
            
            const connection = dataSource.connection;

            let server = 'server';
            if (dataSource.type == 'mysql') {
                server = 'host';
            }

            const config = {
                database: connection.database,
                [server]: connection.server,
                user: connection.user,
                password: connection.password,
            }

            if (connection.port) {
                config.port = connection.port;
            }

            const { data } = await preViewData(query.data, 'full');

            let queryString = `SELECT ${query.select} FROM ${query.from} WHERE`;
            if (query.where) {
                queryString += `${queryString} ${query.where} AND`;
            }

            queryString = `${queryString} CONCAT(`;

            query.unique.forEach( (u, index) => {
                if (index > 0) {
                    queryString = `${queryString} ,`;
                } 
                queryString = `${queryString} ${u}, '__'`;
            })
            queryString = `${queryString} ) NOT IN (`
            data.forEach((dt, index) => {
                if (index > 0) {
                    queryString = `${queryString} ,`;
                }
                queryString = `${queryString} (`;
                query.unique.forEach((k, i)=> {
                    if (i === 0) {
                        queryString = `${queryString} '`;
                    }

                    queryString = `${queryString}${dt[k]}__`;

                    if (i === query.unique.length - 1) {
                        queryString = `${queryString}'`;
                    }
                })
                queryString = `${queryString} )`;
            })
            queryString = `${queryString} )`;
            const result = await getDataByQuery(config, queryString);
            const [addData, update] = await Promise.all([
                addDataCollection(query.category, dataSource._id, result),
                Query.updateOne({ 
                    _id: query._id
                }, {
                    updatedAt: new Date(Date.now())
                })
            ])
            return true;
        } catch (error) {
            return false;
        }
    }
    // [GET] job/api/update-data/:id
    async updateDataByQuery(req, res, next) {
        try {
            const query = await Query.findOne({
                _id: req.body.id
            });
            const dataSource = await DataSource.findOne({
                _id : ObjectId(query.dataSourceId),
            }).populate('connection');
            
            const connection = dataSource.connection;

            let server = 'server';
            if (dataSource.type == 'mysql') {
                server = 'host';
            }

            const config = {
                database: connection.database,
                [server]: connection.server,
                user: connection.user,
                password: connection.password,
            }

            if (connection.port) {
                config.port = connection.port;
            }

            const { data } = await preViewData(query.data, 'full');

            let queryString = `SELECT ${query.select} FROM ${query.from} WHERE`;
            if (query.where) {
                queryString += `${queryString} ${query.where} AND`;
            }

            queryString = `${queryString} CONCAT(`;

            query.unique.forEach( (u, index) => {
                if (index > 0) {
                    queryString = `${queryString} ,`;
                } 
                queryString = `${queryString} ${u}, '__'`;
            })
            queryString = `${queryString} ) NOT IN (`
            data.forEach((dt, index) => {
                if (index > 0) {
                    queryString = `${queryString} ,`;
                }
                queryString = `${queryString} (`;
                query.unique.forEach((k, i)=> {
                    if (i === 0) {
                        queryString = `${queryString} '`;
                    }

                    queryString = `${queryString}${dt[k]}__`;

                    if (i === query.unique.length - 1) {
                        queryString = `${queryString}'`;
                    }
                })
                queryString = `${queryString} )`;
            })
            queryString = `${queryString} )`;
            const result = await getDataByQuery(config, queryString);
            const [addData, update] = await Promise.all([
                addDataCollection(query.category, dataSource._id, result),
                Query.updateOne({ 
                    _id: query._id
                }, {
                    updatedAt: new Date(Date.now())
                })
            ])
            res.status(200).json({
                msg: 'OK',
                updates: result.length,
            });
        } catch (error) {
            console.log(error)
            res.status(200).json({
                msg: 'Something went wrong',
            });
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
                    check = await testConnection(config);
                    // console.log(check)
                } else if (req.body.dataSourceType == 'postgressql') {
                    check = await testConnectionPG(config);
                    // console.log(check)
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
            });
            const dataSource = await newDataSource.save();
            await Job.updateOne({ _id: job._id}, {
                dataSource: dataSource._id,
                status: STATUS_JOB.PREVIEW_DATA,
            });
            if (req.body.dataSourceType != 'file') {
                const newConnection = new Connection({
                    dataSourceId: dataSource._id,
                    ...req.body,
                })
                const connection = await newConnection.save();
                await DataSource.updateOne({
                    _id: dataSource._id
                }, 
                {
                    connection: connection._id
                })
            }
            return res.redirect(`/job/preview-data/${job._id}`);
        } catch (error) {
            console.log(error);
            req.flash('messageType', 'danger');
            req.flash('message', "Something went wrong. try again.");
            return res.redirect('back');
        }
        
    }
    // [POST] job/add-file/:id
    async addFile(req, res, next) {
        try {
            const job = await Job.findById(req.params.id).populate('dataSource');
            const dataSource = job.dataSource;
            await uploadMutipleFiles(req, res, next);
            const jobApi = {}
            check(req.files.dataSourceObject, jobApi, 'dataSourceObject');
            check(req.files.dataSourceKey, jobApi, 'dataSourceKey');
            check(req.files.dataSourceRequest, jobApi, 'dataSourceRequest');
            const url = `http://${pyHost}:${pyPort}/api/add-files`;
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
                await Promise.all( Object.keys(req.files).map(async key => {
                    const name = key.split('dataSource')[1];
                    if (
                        key == 'dataSourceObject' ||
                        key == 'dataSourceKey' ||
                        key == 'dataSourceRequest'
                    ) {
                        const newFile = new Files({
                            dataSourceId: dataSource._id,
                            name: req.files[key][0].originalname,
                            location: req.files[key][0].firebaseUrl
                        })
                        const file = await newFile.save();
                        update[`file${name}`] = file._id;
                        update[`${name.toLowerCase()}`] = `${dataSource._id}-${name.toLowerCase()}`;
                    }
                }))
                await DataSource.updateOne({_id : dataSource._id}, update);
                const newDataSource = await DataSource.findOne({_id : dataSource._id});
                for (const key in newDataSource) {
                    if (key === 'key' || key === 'object' || key === 'request') {
                        renameCollection(key, String(newDataSource[key]));
                    }    
                }
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
            console.log(error);
            req.flash('messageType', 'danger');
            req.flash('message', "can't add file. Try again.");
            return res.redirect('back');
        }
    }
    // [POST] job/new-recommend/:id
    async createRecommendation (req, res, next) {
        try {
            const job = await Job.findOne({
                _id : req.params.id,
                userId: req.user._id,
            }).populate('dataSource');
            const dataSource = job.dataSource;
            if (!job) {
                return res.redirect('back');
            }
            const jobApi = {
                jobId: dataSource._id,
                ...req.body,
            };
            const url = `http://${pyHost}:${pyPort}/api/update-recommend`;
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
                // renameCollection('recommends', job._id);
                const updateJob = {
                    ...req.body,
                    status: STATUS_JOB.DETAIL,
                    dataDestination: `${dataSource._id}-recommends`
                }
                await Job.updateOne({ _id: job._id}, updateJob);
                return res.redirect(`/job/detail/${job._id}`);
            })
        } catch (error) {
            console.log(error);
            req.flash('messageType', 'danger');
            req.flash('message', json.message + ", Try again.");
            return res.redirect('back');
        }
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
    async destroy(req, res, next) {
        const job = await Job.findOne({ _id : req.params.id}).populate('dataSource');
        const dataSource = job.dataSource;
        Job.deleteOne({ _id : req.params.id })
            .then(async () => {
                const request = dropCollection(`${dataSource._id}-request`);
                const object = dropCollection(`${dataSource._id}-object`);
                const key = dropCollection(`${dataSource._id}-key`);
                const recommends = dropCollection(`${dataSource._id}-recommends`);
                Promise.all([
                    request, object, key, recommends
                    , DataSource.deleteOne({_id: dataSource._id})
                ])
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
    // [GET] /job/api/auto-update/:id
    async autoUpdate(req, res) {
        try {
            const job = await Job.findOne({ _id: req.params.id }).populate('dataSource');
            if(!job || job == null || !job.dataDestination) {
                return res.status(404).json({
                    msg: "Job Not found",
                })
            }
            const dataSource = job.dataSource;

        } catch (error) {
            return res.status(404).json({
                msg: "Job Not found",
            })
        }
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

async function renameCollection(name, newName) {
    const listCollections = await db.db.listCollections().toArray();
    listCollections.forEach( collection => {
        if (collection.name == `${name}`) {
            console.log(`${newName}`);
            db.collection(name).rename(`${newName}`);
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
            db.db.collection(`${jobId}-${name}`).insertMany(data, function(error, record){
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

async function preViewData(collection, limit = 20) {
    try {
        let count;
        let data;
        if (limit == 'full') {
            [count, data] = await Promise.all([
                db.db.collection(collection).countDocuments(),
                db.db.collection(collection).find({},{
                    _id: false,
                }).toArray()
            ]);
        }
        else {
            [count, data] = await Promise.all([
                db.db.collection(collection).countDocuments(),
                db.db.collection(collection).find({},{
                    _id: false,
                }).limit(limit).toArray()
            ]);
        }
        let current = 20 ;
        if (count <= 20 ) {
            current = count;
        }

        if (limit && typeof limit === 'number') {
            current = limit;
            if (count <= limit ) {
                current = count;
            }
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
        return { data: []};
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

function hasNotDuplicatesArray(array) {
    return (new Set(array)).size === array.length;
}

module.exports = new JobController();
