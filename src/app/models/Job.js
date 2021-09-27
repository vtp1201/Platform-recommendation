const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Job = new Schema(
    {
        userId: { type: String, required: true,},
        name: { type: String, required:true,},
        description: { type: String,},
        service: String,
        dataSource: String,
        dataDestination: String,
    },
    {
        timestamps: true,
    },
)

Job.plugin(mongooseDelete, {
    deleteAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Job', Job);
