const express = require('express');
const user = express.Router();
const handlers = require('./handlers');

user.use(handlers.allowAuthorized);
user.get('/', handlers.serveHomePage);
user.get('/newStory', handlers.newStory);
user.get('/stories', handlers.serveStoriesPage);
user.get('/edit/:id', handlers.serveEditDraftPage);
user.get('/draft/:id', handlers.serveDraft);
user.get('/searchPage', handlers.serveSearchPage);
user.get('/search', handlers.search);
user.get('/profile/:userId', handlers.serveProfile);
user.post('/publish', handlers.hasFields(['id', 'tags']), handlers.publish);
user.post('/follow', handlers.hasFields(['authorId']), handlers.follow);
user.post('/unFollow', handlers.hasFields(['authorId']), handlers.unFollow);
user.post('/clap', handlers.hasFields(['id']), handlers.clap);
user.post('/logout', handlers.logout);
user.post(
  '/updateStory',
  handlers.hasFields(['title', 'blocks']),
  handlers.updateStory
);
user.post(
  '/addResponse',
  handlers.hasFields(['id', 'response']),
  handlers.addResponse
);
user.post(
  '/deleteDraft',
  handlers.hasFields(['draftId']),
  handlers.deleteDraft
);

module.exports = {user};
