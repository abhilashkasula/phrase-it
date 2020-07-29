const moment = require('moment');
const {request} = require('./request');
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
    .then(({id, login, name, avatar_url}) => {
      req.session.id = id;
      req.session.userName = login;
      req.app.locals.db
        .addUser({id, name: name || login, avatar_url})
        .then(() => {
          res.redirect('/');
        })
        .catch(() => {
          res.redirect('/');
        });
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

const updateStory = (req, res) => {
  const {title, id, blocks} = req.body;
  if (!id) {
    return req.app.locals.db
      .createStory(req.session.id, title, JSON.stringify(blocks))
      .then((id) => res.json({id}));
  }
  req.app.locals.db
    .updateStory(id, title, req.session.id, JSON.stringify(blocks))
    .then((result) => {
      const code = result.error ? statusCodes.NOT_FOUND : statusCodes.OK;
      res.status(code).json(result);
    });
};

const handleHomePage = function (req, res) {
  if (req.session.isNew) {
    res.render('index', {CLIENT_ID: req.app.locals.CLIENT_ID});
  } else {
    const {id} = req.session;
    req.app.locals.db
      .getUserDetails(id)
      .then(({username, avatar_url}) => {
        res.render('home', {username, avatar_url, isUserAuth: true});
      })
      .catch((err) => {
        res.status(statusCodes.NOT_AUTH).json(err);
      });
  }
};

const parseContent = (stories) => {
  return stories.map((story) => {
    story.content = JSON.parse(story.content);
    return story;
  });
};

const storiesPage = async (req, res) => {
  const {id} = req.session;
  let drafts = await req.app.locals.db.getDrafts(id);
  let published = await req.app.locals.db.getUserPublishedStories(id);
  drafts = parseContent(drafts);
  published = parseContent(published);
  req.app.locals.db
    .getUserDetails(id)
    .then(({username, avatar_url}) => {
      const options = {
        username,
        avatar_url,
        drafts,
        moment,
        published,
        isUserAuth: id,
      };
      res.render('stories', options);
    })
    .catch((err) => res.status(statusCodes.NOT_AUTH).json(err));
};

const newStory = (req, res) => {
  req.app.locals.db.getUserDetails(req.session.id).then(({avatar_url}) => {
    res.render('editor', {avatar_url});
  });
};

const allowAuthorized = (req, res, next) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  next();
};

const publish = (req, res) => {
  const {id} = req.body;
  req.app.locals.db
    .publish(req.session.id, id)
    .then((result) => res.json(result))
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
};

const storyPage = (req, res) => {
  const {id} = req.params;
  req.app.locals.db
    .getPublishedStoryDetails(id, req.session.id)
    .then((story) => {
      story.content = JSON.parse(story.content);
      if (!req.session.id) {
        return res.render('story', {story, isUserAuth: false, moment});
      }
      req.app.locals.db.getUserDetails(req.session.id).then(({avatar_url}) => {
        const options = {story, isUserAuth: req.session.id, avatar_url, moment};
        res.render('story', options);
      });
    })
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
};

const getResponses = (req, res) => {
  const {id} = req.query;
  req.app.locals.db
    .getResponses(id)
    .then((responses) => {
      req.app.locals.db.getPublishedStoryDetails(id).then((story) => {
        const options = {story, responses, moment, isUserAuth: true};
        if (!req.session.id) {
          options.isUserAuth = false;
          return res.render('responses', options);
        }
        req.app.locals.db
          .getUserDetails(req.session.id)
          .then(({avatar_url}) => {
            options.avatar_url = avatar_url;
            res.render('responses', options);
          });
      });
    })
    .catch((error) => res.status(statusCodes.BAD_REQUEST).json(error));
};

const addResponse = (req, res) => {
  const {id, response} = req.body;
  req.app.locals.db
    .addResponse(id, req.session.id, response)
    .then((result) => res.json(result))
    .catch((error) => res.status(statusCodes.BAD_REQUEST).json(error));
};

const hasFields = (fields) => {
  return (req, res, next) => {
    if (fields.every((field) => field in req.body)) {
      return next();
    }
    res.status(statusCodes.BAD_REQUEST).send('Bad Request');
  };
};

const notFound = function (req, res) {
  res.status(statusCodes.NOT_FOUND).render('notFound');
};

const serveEditDraftPage = (req, res) => {
  req.app.locals.db.getDraft(req.params.id, req.session.id).then((draft) => {
    if (!draft) {
      return res.status(statusCodes.NOT_FOUND).render('notFound');
    }
    req.app.locals.db
      .getUserDetails(req.session.id)
      .then((user) => res.render('editDraft', {avatar_url: user.avatar_url}));
  });
};

const serveDraft = (req, res) => {
  req.app.locals.db.getDraft(req.params.id, req.session.id).then((draft) => {
    if (!draft) {
      return res.status(statusCodes.NOT_FOUND).json({error: 'Draft not found'});
    }
    res.json({draft});
  });
};

const followAuthor = (req, res) => {
  req.app.locals.db
    .followAuthor(req.session.id, +req.body.authorId)
    .then((status) => res.json(status))
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
};

const serveDashBoardStories = (req, res) => {
  req.app.locals.db
    .getFollowingStories(req.session.id)
    .then((stories) => res.json(stories));
};

const unFollow = (req, res) => {
  req.app.locals.db
    .unFollowAuthor(req.session.id, +req.body.authorId)
    .then((status) => res.json(status))
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
};

module.exports = {
  updateStory,
  getUserDetails,
  handleHomePage,
  storiesPage,
  newStory,
  allowAuthorized,
  publish,
  storyPage,
  hasFields,
  notFound,
  getResponses,
  addResponse,
  serveEditDraftPage,
  serveDraft,
  followAuthor,
  serveDashBoardStories,
  unFollow,
};
