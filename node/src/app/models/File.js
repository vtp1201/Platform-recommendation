const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const File = new Schema(
    {
        dataSourceId: { 
            type: Schema.Types.ObjectId, 
            ref: 'DataSource',
            required: true,
        },
        name : {
            type: Schema.Types.String,
        },
        location: {
            type: Schema.Types.String,
        },
    },
    {
        timestamps: true,
    },
)

File.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('File', File);
