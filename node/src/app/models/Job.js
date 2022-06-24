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
        description: { 
            type: Schema.Types.String,
            required: true,
        },
        service: { 
            type: Schema.Types.String,
        },
        status: { 
            type: Schema.Types.String,
        },
        object: { 
            type: Schema.Types.String,
        },
        key: { 
            type: Schema.Types.String,
        },
        request: { 
            type: Schema.Types.String,
        },
        dataSource: {
            type : Schema.Types.ObjectId,
            ref: "DataSource",
        },
        dataDestination: { 
            type: Schema.Types.String,
        },
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
