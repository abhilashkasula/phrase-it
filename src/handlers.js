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

const updateStory = (req, res) => {
  const {title, id, blocks} = req.body;
  if (!id) {
    return req.app.locals.db
      .createStory(req.session.id, title, JSON.stringify(blocks))
      .then((id) => res.json({id}));
  }
  req.app.locals.db
    .updateStory(id, title, req.session.id, JSON.stringify(blocks))
    .then((result) => res.json(result))
    .catch((err) => res.status(statusCodes.NOT_FOUND).json(err));
};

const serveHomePage = (req, res) => {
  if (req.session.isNew) {
    return res.render('index', {CLIENT_ID: req.app.locals.CLIENT_ID});
  }
  const {username, avatar_url} = req.session;
  res.render('home', {username, avatar_url, isUserAuth: true});
};

const parseContent = (stories) => {
  return stories.map((story) => {
    story.content = JSON.parse(story.content);
    return story;
  });
};

const serveStoriesPage = async (req, res) => {
  const {id, username, avatar_url} = req.session;
  let drafts = await req.app.locals.db.getDrafts(id);
  let published = await req.app.locals.db.getUserPublishedStories(id);
  drafts = parseContent(drafts);
  published = parseContent(published);
  const options = {username, avatar_url, drafts, published, isUserAuth: id};
  res.render('stories', options);
};

const newStory = (req, res) => {
  const {username, avatar_url} = req.session;
  res.render('editor', {username, avatar_url});
};

const allowAuthorized = (req, res, next) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  next();
};

const publish = (req, res) => {
  const {id, tags} = req.body;
  req.app.locals.db
    .publish(req.session.id, id, tags)
    .then((result) => res.json(result))
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
};

const getViews = async (req, userId, {id, authorId}) => {
  const {views} = await req.app.locals.db.updateViews(userId, id, authorId);
  return views;
};

const serveStoryPage = (req, res) => {
  const {id, username, avatar_url} = req.session;
  req.app.locals.db
    .getPublishedStoryDetails(req.params.id, id)
    .then(async (story) => {
      story.content = JSON.parse(story.content);
      story.views = await getViews(req, id, story);
      if (!id) {
        return res.render('story', {story, isUserAuth: false});
      }
      res.render('story', {isUserAuth: id, username, avatar_url, story});
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
      const options = {story, responses, isUserAuth: true};
      if (!id) {
        options.isUserAuth = false;
        return res.render('responses', options);
      }
      Object.assign(options, {username, avatar_url});
      res.render('responses', options);
    })
    .catch((error) => res.status(statusCodes.NOT_FOUND).json(error));
};

const addResponse = (req, res) => {
  const {id, response} = req.body;
  req.app.locals.db
    .addResponse(id, req.session.id, response)
    .then((result) => res.json(result))
    .catch((error) => res.status(statusCodes.BAD_REQUEST).json(error));
};

const clap = (req, res) => {
  const {id} = req.body;
  req.app.locals.db
    .clap(id, req.session.id)
    .then((result) => res.json(result))
    .catch((error) => res.status(statusCodes.BAD_REQUEST).json(error));
};

const hasFields = (fields) => {
  return (req, res, next) => {
    if (fields.every((field) => field in req.body)) {
      return next();
    }
    const error = 'Required fields not present';
    res.status(statusCodes.BAD_REQUEST).json({error});
  };
};

const serveNotFound = (req, res) => {
  res.status(statusCodes.NOT_FOUND).render('notFound');
};

const serveEditDraftPage = (req, res) => {
  const {id, username, avatar_url} = req.session;
  req.app.locals.db
    .getDraft(req.params.id, id)
    .then(() => res.render('editDraft', {username, avatar_url}))
    .catch(() => serveNotFound(req, res));
};

const serveDraft = (req, res) => {
  req.app.locals.db
    .getDraft(req.params.id, req.session.id)
    .then((draft) => res.json({draft}))
    .catch((err) => res.status(statusCodes.NOT_FOUND).json(err));
};

const follow = (req, res) => {
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

const logout = (req, res) => {
  req.session = null;
  res.json({status: 'Logged out'});
};

const serveMyProfilePage = (req, res) => {
  req.app.locals.db
    .getUserDetails(req.session.id)
    .then((userDetails) => {
      const {username, avatar_url} = userDetails;
      userDetails.stories = parseContent(userDetails.stories);
      const details = {username, avatar_url, isUserAuth: true, userDetails};
      res.render('profile', details);
    })
    .catch(() => serveNotFound(req, res));
};

const serveSearchPage = (req, res) => {
  req.app.locals.db
    .getUserDetails(req.session.id)
    .then((userDetails) => {
      userDetails.isUserAuth = true;
      res.render('searchPage', userDetails);
    })
    .catch(() => serveNotFound(req, res));
};

const search = (req, res) => {
  req.app.locals.db
    .search(req.query.keyword)
    .then((searchedContent) => res.json(searchedContent))
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
};

const deleteDraft = function (req, res) {
  req.app.locals.db
    .deleteDraft(req.body.draftId, req.session.id)
    .then((status) => res.json(status))
    .catch((err) => res.status(statusCodes.NOT_FOUND).json(err));
};

const serveUserProfile = (req, res) => {
  req.app.locals.db
    .getUserDetails(req.session.id)
    .then(({username, avatar_url}) => {
      req.app.locals.db
        .getUserDetails(req.params.userId)
        .then((userDetails) => {
          userDetails.stories = parseContent(userDetails.stories);
          const details = {username, avatar_url, isUserAuth: true, userDetails};
          res.render('profile', details);
        })
        .catch(() => serveNotFound(req, res));
    })
    .catch(() => serveNotFound(req, res));
};

module.exports = {
  updateStory,
  getUserDetails,
  serveHomePage,
  serveStoriesPage,
  newStory,
  allowAuthorized,
  publish,
  serveStoryPage,
  hasFields,
  serveNotFound,
  getResponses,
  addResponse,
  serveEditDraftPage,
  serveDraft,
  follow,
  serveDashBoardStories,
  unFollow,
  clap,
  logout,
  serveMyProfilePage,
  serveSearchPage,
  search,
  deleteDraft,
  serveUserProfile,
};
