const express = require('express');
const {request} = require('./request');
const {CLIENT_ID, CLIENT_SECRET} = process.env;

const app = express();

app.get('/', (req, res) => {
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
  res.redirect(githubUrl);
});

const getTokenOptions = (query) => ({
  host: 'github.com',
  path: `/login/oauth/access_token?${query}`,
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
});

const getDetailsOptions = (token) => ({
  host: 'api.github.com',
  path: '/user',
  method: 'GET',
  headers: {
    'User-Agent': 'curl/7.64.1',
    Authorization: `token ${token}`,
  },
});

const requestUserDetails = (req, res, token) => {
  const detailsOptions = getDetailsOptions(token);
  request(detailsOptions)
    .then((data) => {
      res.json(data);
    })
    .catch(() => res.status(404).send('Err'));
};

app.get('/user', (req, res) => {
  const {code} = req.query;
  const query = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;
  const tokenOptions = getTokenOptions(query);
  request(tokenOptions)
    .then(({access_token}) => requestUserDetails(req, res, access_token))
    .catch(() => res.status(404).send('Err'));
});

app.listen(8000, () => console.log('listening'));
