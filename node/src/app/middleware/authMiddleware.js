const User = require('../models/User');
const Job = require('../models/Job');

module.exports = {
    checkNotLogged: (req, res, next) => {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');
    },
    
    checkLogged: (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect('back');
        }
        next();
    },

    checkKey: async (req, res, next) => {
        if (!req.query.secretKey || !req.query.jobId) {
            res.status(401).json({
                message: "Secret key or jobId is missing!"
            });
            return;
        }
        const job = await Job.findOne({ 
            _id: req.query.jobId
        }).populate('userId')
        if (job.userId?.key != req.query.secretKey) {
            res.status(401).json({
                message: "Secret key is incorrect!"
            });
            return;
        }
        next();
    }
};