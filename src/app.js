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
app.get('/responses', handlers.getResponses);

const privateRoutes = [
  '/newStory',
  '/updateStory',
  '/stories',
  '/publish',
  '/discoverStories',
  '/edit',
  '/draft',
  '/addResponse',
];

app.use(privateRoutes, handlers.allowAuthorized);

app.get('/newStory', handlers.newStory);
app.get('/discoverStories', handlers.getDiscoverStories);
app.get('/dashboardStories', handlers.serveDashBoardStories);
app.post('/updateStory', handlers.hasFields(updateField), handlers.updateStory);
app.get('/stories', handlers.storiesPage);
app.post('/publish', handlers.hasFields(['id']), handlers.publish);
app.get('/edit/:id', handlers.serveEditDraftPage);
app.get('/draft/:id', handlers.serveDraft);
app.post('/follow', handlers.hasFields(['authorId']), handlers.followAuthor);
app.post(
  '/addResponse',
  handlers.hasFields(['id', 'response']),
  handlers.addResponse
);
app.use(handlers.notFound);

module.exports = {app};
