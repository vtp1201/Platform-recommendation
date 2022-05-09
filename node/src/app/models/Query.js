const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Query = new Schema(
    {
        DataSourceId: { 
            type: Schema.Types.ObjectId, 
            required: true,
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
        ]
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
