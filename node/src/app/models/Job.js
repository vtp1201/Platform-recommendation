const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Job = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: { 
            type: Schema.Types.String,
            required: true,
        },
        description: Schema.Types.String,
        service: Schema.Types.String,
        object: Schema.Types.String,
        key: Schema.Types.String,
        request: Schema.Types.String,
        dataSource: {
            type : Schema.Types.ObjectId,
            ref: "DataSource",
        },
        dataDestination: Schema.Types.String
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
