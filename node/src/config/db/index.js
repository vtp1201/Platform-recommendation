const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/Platform_recommendation', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connect succeeded');
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = { connect };
