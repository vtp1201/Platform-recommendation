const CronJob = require('cron').CronJob

exports.createCronJob = ({ timePattern, callback }) => {
  const cron = new CronJob({
    cronTime: timePattern,
    onTick: () => callback(),
    start: true
  })
  cron.start()
}

exports.createCronJobs = ({ cronJobList }) => {
  if (cronJobList && cronJobList.length > 0) {
    for (const cronObject of cronJobList) {
      this.createCronJob({
        timePattern: cronObject.timePattern,
        callBack: cronObject.callBack
      })
    }
  }
}
  