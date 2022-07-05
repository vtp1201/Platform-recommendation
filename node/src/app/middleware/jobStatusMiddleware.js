const Job = require('../models/Job');

exports.directPage = async (req, res, next) => {
    const url = req.url
    const job = await Job.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });
    if (url === `/${job.status}/${job._id}`) {
        return next();
    }
    return res.redirect(`/job/${job.status}/${job._id}`)
}