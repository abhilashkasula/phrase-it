const statusCodes = require('./statusCodes');

const parseContent = (stories) => {
  return stories.map((story) => {
    story.content = JSON.parse(story.content);
    return story;
  });
};

const serveHomePage = async (req, res) => {
  const {id, username, avatar_url} = req.session;
  let stories = await req.app.locals.db.getDashboardStories(id);
  stories = parseContent(stories);
  res.render('home', {id, username, avatar_url, isUserAuth: true, stories});
};

const allowAuthorized = (req, res, next) => {
  if (req.session.isNew) {
    return res.redirect('/');
  }
  next();
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

const serveStoriesPage = async (req, res) => {
  const {id, username, avatar_url} = req.session;
  const drafts = await req.app.locals.db.getDrafts(id);
  const published = await req.app.locals.db.getUserPublishedStories(id);
  const options = {id, username, avatar_url, isUserAuth: true};
  options.drafts = parseContent(drafts);
  options.published = parseContent(published);
  res.render('stories', options);
};

const newStory = (req, res) => {
  const {username, avatar_url} = req.session;
  res.render('editor', {username, avatar_url});
};

const publish = (req, res) => {
  const {id, tags} = req.body;
  const {coverImage} = req.files || {coverImage: {}};
  const storeLocation = `${__dirname}/../database/images/${coverImage.md5}`;
  coverImage.mv && coverImage.mv(storeLocation);
  const parsedTags = tags ? tags.split(',') : [];
  req.app.locals.db
    .publish(req.session.id, +id, parsedTags, coverImage.md5)
    .then((result) => res.json(result))
    .catch((err) => res.status(statusCodes.BAD_REQUEST).json(err));
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
    .then(() => res.render('editDraft', {id, username, avatar_url}))
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

const serveSearchPage = (req, res) => {
  const {id, username, avatar_url} = req.session;
  res.render('searchPage', {id, username, avatar_url, isUserAuth: true});
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

const serveProfile = (req, res) => {
  const {id, username, avatar_url} = req.session;
  req.app.locals.db
    .getUserDetails(req.params.userId)
    .then((userDetails) => {
      userDetails.stories = parseContent(userDetails.stories);
      const details = {id, isUserAuth: true, username, avatar_url, userDetails};
      res.render('profile', details);
    })
    .catch(() => serveNotFound(req, res));
};

module.exports = {
  updateStory,
  serveStoriesPage,
  newStory,
  allowAuthorized,
  publish,
  hasFields,
  serveNotFound,
  addResponse,
  serveEditDraftPage,
  serveDraft,
  follow,
  unFollow,
  clap,
  logout,
  serveSearchPage,
  search,
  deleteDraft,
  serveProfile,
  serveHomePage,
};
