const https = require('https');
const statusCodes = require('./statusCodes');

const request = (options) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let json = '';
      res.on('data', function (chunk) {
        json += chunk;
      });
      res.on('end', () => {
        const data = JSON.parse(json);
        if (data.error) {
          return reject(data.error);
        }
        resolve(data);
      });
    });
    req.end();
  });
};

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
    .then(({id, login}) => {
      req.session.id = id;
      res.render('home', {isUserAuth: true, username: login});
    })
    .catch(() => res.status(statusCodes.NOT_FOUND).send('Err'));
};

const getUserDetails = function (req, res) {
  const {code} = req.query;
  const clientId = `client_id=${req.app.locals.CLIENT_ID}`;
  const clientSecret = `client_secret=${req.app.locals.CLIENT_SECRET}`;
  const query = `${clientId}&${clientSecret}&code=${code}`;
  const tokenOptions = getTokenOptions(query);
  request(tokenOptions)
    .then(({access_token}) => requestUserDetails(req, res, access_token))
    .catch(() => res.status(statusCodes.NOT_FOUND).send('Err'));
};

const createStory = (req, res) => {
  req.app.locals.db.createStory('john').then((id) => res.json({id}));
};

const updateStory = (req, res) => {
  const {title, id, blocks} = req.body;
  req.app.locals.db
    .updateStory(id, title, 'john', JSON.stringify(blocks))
    .then((result) => {
      const code = result.error ? statusCodes.NOT_FOUND : statusCodes.OK;
      res.status(code).json(result);
    });
};

const getDrafts = (req, res) => {
  req.app.locals.db.getDrafts().then((drafts) => res.json(drafts));
};

const handleHomePage = function (req, res) {
  if (req.session.isNew) {
    res.render('index', {CLIENT_ID: req.app.locals.CLIENT_ID});
  } else {
    res.render('home', {});
  }
};

module.exports = {
  updateStory,
  getDrafts,
  createStory,
  getUserDetails,
  handleHomePage,
};
