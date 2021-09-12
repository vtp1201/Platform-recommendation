const siteRouter = require('./site');
const authRouter = require('./auth');

function route(app) {
    
    app.use('/', siteRouter);

    app.use('/auth', authRouter);

    app.use((req, res) => {
        res.render('notfound')
    });
}

module.exports = route;