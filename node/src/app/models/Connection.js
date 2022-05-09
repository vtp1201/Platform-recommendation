const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Connection = new Schema(
    {
        dataSourceId: { 
            type: Schema.Types.ObjectId,
            ref: 'DataSource',  
            required: true,
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
    },
    {
        timestamps: true,
    },
)

Connection.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Connection', Connection);
