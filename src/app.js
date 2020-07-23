const express = require('express');
const logger = require('morgan');
const {getUserToken} = require('./handlers');
const {CLIENT_ID, CLIENT_SECRET} = process.env;
const sqlite = require('sqlite3');
const handlers = require('./handlers');
const Database = require('./database');
const {DB_NAME} = require('../config');

const app = express();
const db = new Database(new sqlite.Database(DB_NAME));
app.locals.db = db;

app.use(logger('common'));
app.set('views', './public/pug');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', {CLIENT_ID});
});

app.get('/user', getUserToken.bind({CLIENT_SECRET, CLIENT_ID}));

app.get('/create-story', handlers.createStory);
app.post('/save-new-story', handlers.saveNewStory);
app.get('/show-drafts', handlers.showDrafts);

module.exports = {app};
