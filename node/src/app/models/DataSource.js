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
        port: {
            type : Schema.Types.Number,
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
        queryobject: {
            select: Schema.Types.String,
            from: Schema.Types.String,
            where: Schema.Types.String,
        },
        queryrequest: {
            select: Schema.Types.String,
            from: Schema.Types.String,
            where: Schema.Types.String,
        },
        querykey: {
            select: Schema.Types.String,
            from: Schema.Types.String,
            where: Schema.Types.String,
        },
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
