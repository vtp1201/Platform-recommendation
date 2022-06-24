const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const User = new Schema(
    {
        local            : {
            username     : Schema.Types.String,
            password     : Schema.Types.String,
        },
        key: {
            type:  Schema.Types.String,
        },
        facebook         : {
            id           : Schema.Types.String,
            token        : Schema.Types.String,
            name         : Schema.Types.String,
            email        : Schema.Types.String,
        },
        twitter          : {
            id           : Schema.Types.String,
            token        : Schema.Types.String,
            displayName  : Schema.Types.String,
            username     : Schema.Types.String,
        },
        google           : {
            id           : Schema.Types.String,
            token        : Schema.Types.String,
            email        : Schema.Types.String,
            name         : Schema.Types.String,
        }
    
    },
    {
        timestamps: true,
    },
);

User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);