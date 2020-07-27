const express = require('express');
const logger = require('morgan');
const sqlite = require('sqlite3');
const session = require('cookie-session');
const handlers = require('./handlers');
const Database = require('./database');
const {DB_NAME, CLIENT_ID, CLIENT_SECRET, SECRET_MSG} = require('../config');

const updateField = ['title', 'blocks'];
const app = express();
const db = new Database(new sqlite.Database(DB_NAME));
app.locals = {db, CLIENT_ID, CLIENT_SECRET, SECRET_MSG};

app.use(logger('common'));
app.set('view engine', 'pug');
app.use(express.static('public', {index: false}));
app.use(express.json());
app.set('sessionMiddleware', session({secret: SECRET_MSG}));

app.use((...args) => app.get('sessionMiddleware')(...args));

app.get('/', handlers.handleHomePage);

app.get('/user', handlers.getUserDetails);

app.get('/story/:id', handlers.storyPage);

app.use(
  [
    '/newStory',
    '/updateStory',
    '/stories',
    '/publish',
    '/publishedStories',
    '/responses',
  ],
  handlers.allowAuthorized
);
app.get('/newStory', handlers.newStory);
app.get('/publishedStories', handlers.getPublishedStories);
app.post('/updateStory', handlers.hasFields(updateField), handlers.updateStory);
app.get('/stories', handlers.storiesPage);
app.post('/publish', handlers.hasFields(['id']), handlers.publish);
app.get('/responses', handlers.getResponses);
app.use(handlers.notFound);

module.exports = {app};
