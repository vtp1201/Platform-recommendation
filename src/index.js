const path = require('path');
const express = require('express');
const ejs = require('ejs');
const expressSession = require('express-session');

const app = express();

const db = require('./config/db/index');
const route = require('./routes/index');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/jquery/dist')));

app.use(expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

db.connect();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

global.loggedIn = null;
app.use("*", (req, res, next) => {
    loggedIn = req.session.userId;
    next()
});

route(app);

app.listen(5000, () => {
    console.log('listening on port 5000');
});
