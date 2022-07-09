const mongoose = require('mongoose');

/* function connect() {
    try {
        mongoose.connect('mongodb://localhost:27017/Platform_recommendation', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connect succeeded');
        return true;
    }
    catch (err) {
        return false;
    }
}

function tryConnect() {
    const result = await connect();
    if (result == false) {
        console.error('Failed to connect to mongo on startup - retrying in 5 sec', err)
        setTimeout(tryConnect(), 5000);
    }
} */
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || 'Platform_recommendation'
const dbUser = process.env.MONGO_USER || ''
const dbPass = process.env.MONGO_PASSWORD || ''
const mongoUrl = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`

const connectWithRetry = function () { // when using with docker, at the time we up containers. Mongodb take few seconds to starting, during that time NodeJS server will try to connect MongoDB until success.
    return mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected!"))
    .catch(err => {
        if (err) {
            console.log('Failed to connect to mongo on startup - retrying in 5 sec', err)
            setTimeout(connectWithRetry, 5000)
        }
    })
}
  
module.exports = { connectWithRetry };
