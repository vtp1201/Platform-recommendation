const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Job = new Schema(
    {
        userId: { type: String, required: true,},
        title: { type: String, required: true,},
        description: { type: String,},
        service: String,
        object: String,
        key: String,
        request: String,
        dataSource: {
            object: String,
            key: String,
            request: String,
        },
        DSLocation: { 
            object: String,
            key: String,
            request: String,
        },
        dataDestination: String,
        DDLocation: String,
    },
    {
        timestamps: true,
    },
)

Job.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Job', Job);
