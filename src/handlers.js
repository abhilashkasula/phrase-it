const {request} = require('./request');
const statusCodes = require('./statusCodes');
const {getDetailsOptions, getTokenOptions} = require('./options');

const requestUserDetails = (req, res, token) => {
  const detailsOptions = getDetailsOptions(token);
  const error = 'No user found';
  request(detailsOptions)
    .then(({id, login, name, avatar_url}) => {
      req.session.id = id;
      req.session.username = name || login;
      req.session.avatar_url = avatar_url;
      req.app.locals.db
        .addUser({id, name: name || login, avatar_url})
        .then(() => res.redirect('/'))
        .catch(() => res.redirect('/'));
    })
    .catch(() => res.status(statusCodes.NOT_FOUND).json({error}));
};

const getUserDetails = (req, res) => {
  const {code} = req.query;
  const error = 'Code not found';
  const clientId = `client_id=${req.app.locals.CLIENT_ID}`;
  const clientSecret = `client_secret=${req.app.locals.CLIENT_SECRET}`;
  const query = `${clientId}&${clientSecret}&code=${code}`;
  const tokenOptions = getTokenOptions(query);
  request(tokenOptions)
    .then(({access_token}) => requestUserDetails(req, res, access_token))
    .catch(() => res.status(statusCodes.NOT_FOUND).json({error}));
};

const serveIndex = (req, res) => {
  if (req.session.isNew) {
    return res.render('index');
  }
  res.redirect('/user');
};

const serveStoryPage = (req, res) => {
  const {id, username, avatar_url} = req.session;
  const {db} = req.app.locals;
  db.getPublishedStoryDetails(req.params.id, id)
    .then(async (story) => {
      story.content = JSON.parse(story.content);
      story.views = await db.updateViews(id, story.id, story.authorId);
      const options = {story, isUserAuth: false};
      if (!id) {
        return res.render('story', options);
      }
      options.isUserAuth = true;
      options.isFollowing = await db.isFollowing(story.authorId, id);
      Object.assign(options, {id, username, avatar_url});
      res.render('story', options);
    })
    .catch(() => serveNotFound(req, res));
};

const getResponses = (req, res) => {
  const {storyId} = req.params;
  const {id, username, avatar_url} = req.session;
  const {db} = req.app.locals;
  db.getResponses(storyId)
    .then(async (responses) => {
      const story = await db.getPublishedStoryDetails(storyId, id);
      const options = {story, responses, isUserAuth: false};
      if (!id) {
        return res.render('responses', options);
      }
      options.isUserAuth = true;
      Object.assign(options, {id, username, avatar_url});
      res.render('responses', options);
    })
    .catch((error) => res.status(statusCodes.NOT_FOUND).json(error));
};

const serveNotFound = (req, res) => {
  res.status(statusCodes.NOT_FOUND).render('notFound');
};

module.exports = {
  getUserDetails,
  serveStoryPage,
  serveNotFound,
  getResponses,
  serveIndex,
};
