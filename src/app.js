const express = require('express');
const logger = require('morgan');
const {getUserToken} = require('./handlers');
const {CLIENT_ID, CLIENT_SECRET} = process.env;
const app = express();

app.use(logger('common'));
app.set('views', './public/pug');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.render('index', {CLIENT_ID});
});

app.get('/user', getUserToken.bind({CLIENT_SECRET, CLIENT_ID}));

module.exports = {app};
