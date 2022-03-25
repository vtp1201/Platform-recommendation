const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const User = new Schema(
    {
        local            : {
            username     : String,
            password     : String
        },
        facebook         : {
            id           : String,
            token        : String,
            name         : String,
            email        : String
        },
        twitter          : {
            id           : String,
            token        : String,
            displayName  : String,
            username     : String
        },
        google           : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        }
    
    },
    {
        timestamps: true,
    },
);

User.pre('saveLocal', function(next) {
    const user = this;
    bcrypt.hash(user.local.password, 10, (err, hash) => {
        user.local.password = hash;
        next();
    });
});

User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);