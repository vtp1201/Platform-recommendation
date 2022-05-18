const path = require('path');
const express = require('express');
const ejs = require('ejs');
const flash = require('connect-flash');
const expressSession = require('express-session');
const methodOverride = require('method-override');
const passport = require('passport');
const morgan = require('morgan');

const app = express();

const db = require('./config/db/index');
const route = require('./routes/index');
require('./config/passport/passport')(passport);

app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

db.connectWithRetry();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

global.loggedIn = null;
global.loggedName = null;
app.use("*", (req, res, next) => {
    if (req.user) {
        if (req.user.google.name) {
            loggedIn = req.session.passport.user;
            loggedName = req.user.google.name;
        }
        if (req.user.local.username) {
            loggedIn = req.session.passport.user;
            loggedName = req.user.local.username;
        }
        if (req.user.facebook.name) {
            loggedIn = req.session.passport.user;
            loggedName = req.user.facebook.name;
        }
        if (req.user.twitter.name) {
            console.log(req.user.twitter);
            /* loggedIn = req.session.passport.user;
            loggedName = req.user.twitter.name; */
        }
    } else {
        loggedIn = null;
        loggedName = null;
    }
    next()
});

route(app, passport);

const host = process.env.PORT || 5000

app.listen(host, () => {
    console.log(`listening on port ${host}`);
});
