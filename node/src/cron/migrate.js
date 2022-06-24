const Cron = require('./index')
const CronPattern = require('./cronPattern')
const Query = require('../app/models/Query');
const jobController = require('../app/controllers/JobController');


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
        updatedAt: '2017'
    })
    for (const updateQuery of updateQuerys) {
        await jobController.updateDataSchedule(updateQuery)
    }
}