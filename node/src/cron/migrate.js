const Cron = require('./index')
const CronPattern = require('./cronPattern')
const Query = require('../app/models/Query');
const Job = require('../app/models/Job');
const jobController = require('../app/controllers/JobController');
const moment = require('moment');
const mongoose   = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const fetch = require('cross-fetch');

const pyHost = process.env.PYTHON_HOST || 'localhost';
const pyPort = process.env.PYTHON_PORT || 8000;

exports.migrateUpdateData = () => {
    Cron.createCronJob({
      timePattern: CronPattern.EVERY_0H_DAY,
      callback: updateJob,
    })
}

exports.migrateTest = () => {
    Cron.createCronJob({
        timePattern: CronPattern.EVERY_SECONDS,
        callback: test
    })
}

const test = () => {
    console.log('every seconds');
}
  
const updateJob = async () => {
    const updateQuerys = await Query.find({
        update: moment().format('YYYY-MM-DD')
    })
    for (const updateQuery of updateQuerys) {
        await jobController.updateDataSchedule(updateQuery)
        await Query.updateOne({
            _id: updateQuery._id,
        }, {
            update: moment().add(Number(updateQuery.autoUpdate), 'days').format('YYYY-MM-DD'),
        })
    }
    const dataSourceIds = [...new Set(updateQuerys.map(query => String(query.dataSourceId)))];
    const jobs = await Job.find({ 
        dataSource: {
            $in: dataSourceIds.map(id => ObjectId(id))
        }
    }).populate('dataSource')
    for (const job of jobs) {
        if (job.dataDestination) {
            const jobApi = {
                jobId: String(job.dataSource._id),
                ...job
            };
            const url = `http://${pyHost}:${pyPort}/api/update-recommend`;
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(jobApi),
                headers: { 'Content-Type': 'application/json' }
            })
        }
    }
}