const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const slug = require('mongoose-slug-generator');

const Schema = mongoose.Schema;

const User = new Schema(
    {
        username: { type: String, required: true, unique: true},
        password: { type: String, required: true},
        slug: { type: String, slug: 'title', unique: true },
    },
    {
        timestamps: true,
    },
);

User.pre('save', function(next) {
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        user.password = hash;
        next();
    });
});

// plugin
mongoose.plugin(slug);

module.exports = mongoose.model('User', User);