const moment = require('moment');
const { request } = require('./request');
const statusCodes = require('./statusCodes');

const getDetailsOptions = (token) => ({
  host: 'api.github.com',
  path: '/user',
  method: 'GET',
  headers: {
    'User-Agent': 'curl/7.64.1',
    Authorization: `token ${token}`,
  },
});

const getTokenOptions = (query) => ({
  host: 'github.com',
  path: `/login/oauth/access_token?${query}`,
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
});

const requestUserDetails = (req, res, token) => {
  const detailsOptions = getDetailsOptions(token);
  request(detailsOptions)
    .then(({ id, login, name, avatar_url }) => {
      req.session.id = id;
      req.session.userName = login;
      req.app.locals.db
        .addUser({ id, name, avatar_url })
        .then(() => {
          res.redirect('/');
        })
        .catch(() => {
          res.redirect('/');
        });
    })
    .catch(() => res.status(statusCodes.NOT_FOUND).send('Err'));
};

const getUserDetails = function(req, res) {
  const { code } = req.query;
  const clientId = `client_id=${req.app.locals.CLIENT_ID}`;
  const clientSecret = `client_secret=${req.app.locals.CLIENT_SECRET}`;
  const query = `${clientId}&${clientSecret}&code=${code}`;
  const tokenOptions = getTokenOptions(query);
  request(tokenOptions)
    .then(({ access_token }) => requestUserDetails(req, res, access_token))
    .catch(() => res.status(statusCodes.NOT_FOUND).send('Err'));
};

const createStory = (req, res) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  req.app.locals.db.createStory(req.session.id).then((id) => res.json({ id }));
};

const updateStory = (req, res) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  const { title, id, blocks } = req.body;
  req.app.locals.db
    .updateStory(id, title, req.session.id, JSON.stringify(blocks))
    .then((result) => {
      const code = result.error ? statusCodes.NOT_FOUND : statusCodes.OK;
      res.status(code).json(result);
    });
};

const handleHomePage = function(req, res) {
  if (req.session.isNew) {
    res.render('index', { CLIENT_ID: req.app.locals.CLIENT_ID });
  } else {
    const { id } = req.session;
    req.app.locals.db
      .getUserDetails(id)
      .then(({ username, avatar_url }) => {
        res.render('home', { username, avatar_url });
      })
      .catch(() => { });
  }
};

const storiesPage = (req, res) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  req.app.locals.db.getDrafts(req.session.id).then((drafts) => {
    drafts.forEach((draft) => {
      draft.content = JSON.parse(draft.content);
    });
    req.app.locals.db
      .getUserDetails(req.session.id)
      .then(({ username, avatar_url }) => {
        res.render('stories', { username, avatar_url, drafts, moment });
      })
      .catch((err) => res.status(statusCodes.NOT_FOUND).json(err));
  });
};

const newStory = (req, res) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  req.app.locals.db
    .getUserDetails(req.session.id)
    .then(({ avatar_url }) => {
      res.render('editor', { avatar_url });
    })
    .catch((err) => res.status(statusCodes.NOT_FOUND).json(err));
};

module.exports = {
  updateStory,
  createStory,
  getUserDetails,
  handleHomePage,
  storiesPage,
  newStory,
};
