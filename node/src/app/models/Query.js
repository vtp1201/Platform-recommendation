const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Query = new Schema(
    {
        dataSourceId: { 
            type: Schema.Types.ObjectId,
            ref: 'DataSource', 
            required: true,
        },
        data: {
            type: Schema.Types.String,
        },
        select: { 
            type: Schema.Types.String,
        },
        from: { 
            type: Schema.Types.String,
        },
        where: { 
            type: Schema.Types.String,
        },
        unique: [
            Schema.Types.String,
        ],
        autoUpdate: {
            type: Schema.Types.Number,
        }
    },
    {
        timestamps: true,
    },
)

Query.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Query', Query);
