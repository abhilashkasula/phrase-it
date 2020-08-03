const express = require('express');
const logger = require('morgan');
const sqlite = require('sqlite3');
const session = require('cookie-session');
const handlers = require('./handlers');
const Database = require('./database');
const {DB_NAME, CLIENT_ID, CLIENT_SECRET, SECRET_MSG} = require('../config');

const app = express();
const db = new Database(new sqlite.Database(DB_NAME));
app.locals = {db, CLIENT_ID, CLIENT_SECRET, SECRET_MSG};

app.use(logger('common'));
app.set('view engine', 'pug');
app.use(express.static('public', {index: false}));
app.use(express.json());
app.set('sessionMiddleware', session({secret: SECRET_MSG}));

app.use((...args) => app.get('sessionMiddleware')(...args));

app.get('/', handlers.serveHomePage);
app.get('/user', handlers.getUserDetails);
app.get('/story/:id', handlers.serveStoryPage);
app.get('/responses', handlers.getResponses);
app.post('/deleteDraft', handlers.deleteDraft);

const privateRoutes = [
  '/newStory',
  '/updateStory',
  '/stories',
  '/publish',
  '/dashboardStories',
  '/follow',
  '/edit',
  '/draft',
  '/addResponse',
  '/unFollow',
  '/clap',
  '/myProfile',
  '/logout',
  '/searchPage',
  '/search',
  'userProfile',
];
const updateField = ['title', 'blocks'];
const addResField = ['id', 'response'];

app.use(privateRoutes, handlers.allowAuthorized);
app.get('/newStory', handlers.newStory);
app.get('/dashboardStories', handlers.serveDashBoardStories);
app.get('/stories', handlers.storiesPage);
app.get('/edit/:id', handlers.serveEditDraftPage);
app.get('/draft/:id', handlers.serveDraft);
app.get('/myProfile', handlers.serveMyProfilePage);
app.get('/searchPage', handlers.serveSearchPage);
app.get('/search', handlers.search);
app.get('/userProfile', handlers.serveUserProfile);
app.post('/updateStory', handlers.hasFields(updateField), handlers.updateStory);
app.post('/publish', handlers.hasFields(['id', 'tags']), handlers.publish);
app.post('/follow', handlers.hasFields(['authorId']), handlers.follow);
app.post('/unFollow', handlers.hasFields(['authorId']), handlers.unFollow);
app.post('/addResponse', handlers.hasFields(addResField), handlers.addResponse);
app.post('/clap', handlers.hasFields(['id']), handlers.clap);
app.post('/logout', handlers.logout);
app.use(handlers.notFound);

module.exports = {app};
