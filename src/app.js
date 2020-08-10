const express = require('express');
const logger = require('morgan');
const sqlite = require('sqlite3');
const session = require('cookie-session');
const fileUpload = require('express-fileupload');
const handlers = require('./handlers');
const Database = require('./database');
const {user} = require('./userRouter');
const {DB_NAME, CLIENT_ID, CLIENT_SECRET, SECRET_MSG} = require('../config');

const app = express();
const db = new Database(new sqlite.Database(DB_NAME));
app.locals = {db, CLIENT_ID, CLIENT_SECRET, SECRET_MSG};

app.use(logger('common'));
app.set('view engine', 'pug');
app.use(express.static('public', {index: false}));
app.use(express.json());
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(fileUpload());
app.set('sessionMiddleware', session({secret: SECRET_MSG}));

app.use((...args) => app.get('sessionMiddleware')(...args));

app.get('/', handlers.serveIndex);
app.get('/callback', handlers.getUserDetails);
app.get('/story/:id', handlers.serveStoryPage);
app.get('/responses/:storyId', handlers.getResponses);
app.use('/user', user);
app.use('/coverImage', express.static(`${__dirname}/../database/images`));
app.use(handlers.serveNotFound);

module.exports = {app};
