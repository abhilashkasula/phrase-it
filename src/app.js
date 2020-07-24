const express = require('express');
const logger = require('morgan');
const sqlite = require('sqlite3');
const session = require('cookie-session');
const handlers = require('./handlers');
const Database = require('./database');
const { DB_NAME, CLIENT_ID, CLIENT_SECRET, SECRET_MSG } = require('../config');

const app = express();
const db = new Database(new sqlite.Database(DB_NAME));
app.locals.db = db;
app.locals.CLIENT_ID = CLIENT_ID;
app.locals.CLIENT_SECRET = CLIENT_SECRET;
app.locals.SECRET_MSG = SECRET_MSG;

app.use(logger('common'));
app.set('view engine', 'pug');
app.use(express.static('public', { index: false }));
app.use(express.json());
app.set('sessionMiddleware', session({ secret: SECRET_MSG }));

app.use((...args) => app.get('sessionMiddleware')(...args));

app.get('/', handlers.handleHomePage);

app.get('/user', handlers.getUserDetails);

app.get('/newStory', (req, res) => res.render('editor'));
app.get('/createStory', handlers.createStory);
app.post('/updateStory', handlers.updateStory);
app.get('/stories', handlers.handleStoriesPage);

module.exports = { app };
