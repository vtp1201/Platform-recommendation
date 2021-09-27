const siteRouter = require('./site');
const authRouter = require('./auth');
const jobRouter = require('./job');
const userRouter = require('./user');

function route(app) {
    
    app.use('/', siteRouter);

    app.use('/auth', authRouter);

    app.use('/user', userRouter);

    app.use('/job', jobRouter);

    app.use((req, res) => {
        res.render('notfound')
    });
}

module.exports = route;