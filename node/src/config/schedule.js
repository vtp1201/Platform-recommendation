const schedule = require('node-schedule');

const job = {
  scheduleJob: function () {
    schedule.scheduleJob('* /5 * * * * *', function(){
      console.log('The answer to life, the universe, and everything!');
    }
  )}
};

module.exports = job;