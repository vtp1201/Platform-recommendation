const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const DataSource = new Schema(
    {
        jobId: { 
            type: Schema.Types.ObjectId, 
            required: true,
        },
        type: {
            type : Schema.Types.String,
        },
        server: {
            type : Schema.Types.String,
        },
        database: {
            type : Schema.Types.String,
        },
        user: {
            type : Schema.Types.String,
        },
        password: {
            type : Schema.Types.String,
        },
        object: {
            type : Schema.Types.String,
        },
        key : {
            type : Schema.Types.String,
        },
        request : {
            type : Schema.Types.String,
        },
        query: {
            object: Schema.Types.String,
            key : Schema.Types.String,
            request : Schema.Types.String,
        }
    },
    {
        timestamps: true,
    },
)

DataSource.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('DataSource', DataSource);
