const express = require('express');
const logger = require('morgan');
const {getUserToken} = require('./handlers');
const sqlite = require('sqlite3');
const handlers = require('./handlers');
const Database = require('./database');
const {DB_NAME, CLIENT_ID, CLIENT_SECRET} = require('../config');

const app = express();
const db = new Database(new sqlite.Database(DB_NAME));
app.locals.db = db;

app.use(logger('common'));
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', {CLIENT_ID});
});

app.get('/user', getUserToken.bind({CLIENT_SECRET, CLIENT_ID}));

app.get('/newStory', (req, res) => res.render('editor'));
app.get('/createStory', handlers.createStory);
app.post('/updateStory', handlers.updateStory);
app.get('/drafts', handlers.getDrafts);

module.exports = {app};
