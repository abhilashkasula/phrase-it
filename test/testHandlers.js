const request = require('supertest');
const https = require('https');
const sinon = require('sinon');
const {app} = require('../src/app');
const {resetTables} = require('./dbScripts');

describe('Integration tests', () => {
  describe('Handlers', () => {
    describe('unauthorized user', () => {
      beforeEach(async () => {
        app.set('sessionMiddleware', (req, res, next) => {
          req.session = {isNew: true};
          next();
        });
        await resetTables(app.locals.db);
      });

      it('should redirect to / for /newStory', (done) => {
        request(app)
          .get('/user/newStory')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /updateStory', (done) => {
        request(app)
          .post('/user/updateStory')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /stories', (done) => {
        request(app)
          .get('/user/stories')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /publish', (done) => {
        request(app)
          .post('/user/publish')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should give story page with login option', (done) => {
        request(app)
          .get('/story/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/Login/, done);
      });

      it('should give responses page for /responses', (done) => {
        request(app)
          .get('/responses/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/response/, done);
      });

      it('should redirect to / for /edit', (done) => {
        request(app)
          .get('/user/edit/1')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /dashboardStories', (done) => {
        request(app)
          .get('/user/dashboardStories')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /follow', (done) => {
        request(app)
          .get('/user/follow')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /clap', (done) => {
        request(app)
          .get('/user/clap')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /searchPage', (done) => {
        request(app)
          .get('/user/searchPage')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should redirect to / for /search', (done) => {
        request(app)
          .get('/user/search')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should give story page with updated views', (done) => {
        request(app)
          .get('/story/1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/story/i)
          .expect(/technology/) //expecting for tags
          .expect(/maths/)
          .expect(/science/)
          .expect(/thriller/)
          .expect(/sci-fi/)
          .expect(/1 Views/, done); //expecting views
      });

      it('should redirect to / for /profile', (done) => {
        request(app)
          .get('/user/profile/58025056')
          .expect(302)
          .expect('location', '/', done);
      });

      it('should get index page for /', (done) => {
        request(app)
          .get('/')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/Login Using Github/, done);
      });
    });

    describe('authorized user', () => {
      describe('/', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {
              isNew: false,
              id: 56071561,
              username: 'name',
              avatar_url: 'url',
            };
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should redirect /user for authorized user accessing /', (done) => {
          request(app).get('/').expect(302).expect('location', '/user', done);
        });
      });

      describe('/user/newStory', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should get the newStory page for authenticated user', (done) => {
          request(app)
            .get('/user/newStory')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/editor/, done);
        });
      });

      describe('/user/updateStory', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should create story & give back id if id not present', (done) => {
          const block = {type: 'paragraph', data: {text: 'A small paragraph'}};
          request(app)
            .post('/user/updateStory')
            .send({title: 'New blog', blocks: [block]})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({id: 6}, done);
        });

        it('should update story title, content for given story id', (done) => {
          const block = {type: 'paragraph', data: {text: 'A small paragraph'}};
          const data = {id: 2, title: 'A new app', blocks: [block]};
          request(app)
            .post('/user/updateStory')
            .send(data)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Story updated'}, done);
        });

        it('should give 404 for updating story with unknown id', (done) => {
          request(app)
            .post('/user/updateStory')
            .send({id: 100, title: 'Title', blocks: ''})
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({error: 'No draft found'}, done);
        });
      });

      describe('/user/stories', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give story page with available drafts of user', (done) => {
          request(app)
            .get('/user/stories')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/your stories/i, done);
        });
      });

      describe('/user/publish', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            req.files = {coverImage: {mv: () => {}, md5: 'hash'}};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give No draft found for no draft', (done) => {
          request(app)
            .post('/user/publish')
            .send({id: 1, tags: 'tech'})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'No draft found'}, done);
        });

        it('should not publish a story with no content and title', (done) => {
          request(app)
            .post('/user/publish')
            .send({id: 5, tags: 'tech'})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(
              {error: 'Cannot publish a story with empty title and content'},
              done
            );
        });

        it('should publish a story present', (done) => {
          request(app)
            .post('/user/publish')
            .send({id: 2, tags: ''})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Published'}, done);
        });

        it('should publish a story with no cover image', (done) => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            req.files = undefined;
            next();
          });
          request(app)
            .post('/user/publish')
            .send({id: 2, tags: ''})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Published'}, done);
        });
      });

      describe('/story', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give story with tags and views for given id', (done) => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025419};
            next();
          });
          request(app)
            .get('/story/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/story/i)
            .expect(/technology/) //expecting for tags
            .expect(/maths/)
            .expect(/science/)
            .expect(/thriller/)
            .expect(/sci-fi/)
            .expect(/1 Views/, done); //expecting views
        });

        it('should give available options if the user is auth', (done) => {
          request(app)
            .get('/story/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/\/newStory/, done);
        });

        it('should give story with not updated views for my story', (done) => {
          request(app)
            .get('/story/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/story/i)
            .expect(/technology/) //expecting for tags
            .expect(/maths/)
            .expect(/science/)
            .expect(/thriller/)
            .expect(/sci-fi/)
            .expect(/0 Views/, done); //expecting views
        });

        it('should give not found if the story id is absent', (done) => {
          request(app).get('/story/10').expect(404, done);
        });
      });

      describe('/user/edit', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give draft editor page for /edit', (done) => {
          request(app)
            .get('/user/edit/2')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/publish/, done);
        });

        it('should give not found for /edit if draft is absent', (done) => {
          request(app)
            .get('/user/edit/1')
            .expect(404)
            .expect('Content-Type', /html/, done);
        });
      });

      describe('/user/draft', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give the draft for given draft id present', (done) => {
          request(app)
            .get('/user/draft/2')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(/8 Ways to Build Virality into your Product/)
            .expect(/58025056/, done);
        });

        it('should give not found if given draft id not present', (done) => {
          request(app)
            .get('/user/draft/117')
            .expect('Content-Type', /json/)
            .expect({error: 'No draft found'}, done);
        });
      });

      describe('/responses', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give responses page for proper id', (done) => {
          request(app)
            .get('/responses/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/response/, done);
        });

        it('should give not found for unknown id', (done) => {
          request(app)
            .get('/responses/2')
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({error: 'No story found'}, done);
        });
      });

      describe('/user/addResponse', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58028408};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should add response for a published story id', (done) => {
          request(app)
            .post('/user/addResponse')
            .send({id: 1, response: 'some response'})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'added'}, done);
        });

        it('should give bad request for unknown id', (done) => {
          request(app)
            .post('/user/addResponse')
            .send({id: 100, response: 'some response'})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'unknown id'}, done);
        });
      });

      describe('/user/follow', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should follow the author for a valid authorId', (done) => {
          request(app)
            .post('/user/follow')
            .send({authorId: 58026249})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Following'}, done);
        });

        it('should give error for following yourself', (done) => {
          request(app)
            .post('/user/follow')
            .send({authorId: 58025056})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'You cannot follow yourself'}, done);
        });

        it('should give error for following an invalid author', (done) => {
          request(app)
            .post('/user/follow')
            .send({authorId: 1})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'No author found'}, done);
        });

        it('should give err for following already following author', (done) => {
          request(app)
            .post('/user/follow')
            .send({authorId: 58025419})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'Already following'}, done);
        });
      });

      describe('/user/unFollow', () => {
        before(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should unfollow for given already following authorId', (done) => {
          request(app)
            .post('/user/unFollow')
            .send({authorId: 58025419})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Unfollowed'}, done);
        });

        it('should give error for not following authorId given', (done) => {
          request(app)
            .post('/user/unFollow')
            .send({authorId: 56071561})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'You are not a follower of this user'}, done);
        });
      });

      describe('/user/clap', () => {
        before(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58028408};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should clap if the user have not clapped already', (done) => {
          request(app)
            .post('/user/clap')
            .send({id: 3})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({isClapped: true, clapsCount: 2}, done);
        });

        it('should give bad request for unknown id', (done) => {
          request(app)
            .post('/user/clap')
            .send({id: 4})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'No story found'}, done);
        });

        it('should remove clap if the user clapped already', (done) => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58028408};
            next();
          });
          request(app)
            .post('/user/clap')
            .send({id: 3})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({isClapped: false, clapsCount: 1}, done);
        });
      });

      describe('/user/logout', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false};
            next();
          });
        });

        it('should logout from the session', (done) => {
          request(app)
            .post('/user/logout')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Logged out'}, done);
        });
      });

      describe('/user/searchPage', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should render search page', (done) => {
          request(app)
            .get('/user/searchPage')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/searchPage/, done);
        });
      });

      describe('/user/search', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give matching stories based on the keyword', (done) => {
          request(app)
            .get('/user/search?keyword=anil')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(/anil/, done);
        });

        it('should give bad request if the keyword is not proper', (done) => {
          request(app)
            .get('/user/search')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'invalid keyword'}, done);
        });
      });

      describe('/user/deleteDraft', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should delete the draft if draft is present', (done) => {
          request(app)
            .post('/user/deleteDraft')
            .send({draftId: 2})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'deleted'}, done);
        });

        it('should give not found if draft is absent', (done) => {
          request(app)
            .post('/user/deleteDraft')
            .send({draftId: 1})
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({error: 'No draft found'}, done);
        });
      });

      describe('/user/profile', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should give profile for existing user id', (done) => {
          request(app)
            .get('/user/profile/58026402')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/Profile/, done);
        });

        it('should give not found for unknown userId', (done) => {
          request(app)
            .get('/user/profile/1')
            .expect(404)
            .expect('Content-Type', /html/)
            .expect(/Not Found/, done);
        });
      });

      describe('/user', () => {
        beforeEach(async () => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {
              isNew: false,
              id: 56071561,
              username: 'name',
              avatar_url: 'url',
            };
            next();
          });
          await resetTables(app.locals.db);
        });

        it('should redirect to index page if session not exists', (done) => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: true};
            next();
          });
          request(app).get('/user').expect(302).expect('location', '/', done);
        });

        it('should give home page if session exists', (done) => {
          request(app)
            .get('/user')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/56071561/, done);
        });
      });
    });
  });
});

describe('/callback', () => {
  beforeEach(async () => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {};
      next();
    });
    await resetTables(app.locals.db);
  });

  const details = {
    access_token: 1234,
    id: 123,
    name: 'name',
    login: 'login',
    avatar_url: 'avatar',
  };

  const res = {on: (event, callback) => callback(JSON.stringify(details))};

  afterEach(() => sinon.restore());

  it('should redirect to / if there is no error', (done) => {
    sinon.replace(https, 'request', (options, cb) => cb(res));
    request(app)
      .get('/callback?code=somecode')
      .expect(302)
      .expect('location', '/', done);
  });

  it('should redirect to / if user id already exists', (done) => {
    const details = {
      access_token: 1234,
      id: 58025056,
      name: 'name',
      login: 'login',
      avatar_url: 'avatar',
    };
    const res = {on: (event, callback) => callback(JSON.stringify(details))};
    sinon.replace(https, 'request', (options, cb) => cb(res));
    request(app)
      .get('/callback?code=somecode')
      .expect(302)
      .expect('location', '/', done);
  });

  it('should give error if session not exists', (done) => {
    sinon.replace(https, 'request', (options, cb) => cb(res));
    app.set('sessionMiddleware', (req, res, next) => {
      next();
    });
    request(app).get('/callback?code=somecode').expect(404, done);
  });

  it('should give error if user data is not present', (done) => {
    const details = {error: 'Err'};
    const res = {on: (event, callback) => callback(JSON.stringify(details))};
    sinon.replace(https, 'request', (options, cb) => cb(res));
    request(app).get('/callback?code=somecode').expect(404, done);
  });

  it('should redirect to / if user name is absent', (done) => {
    const details = {
      access_token: 1234,
      id: 123,
      name: null,
      login: 'login',
      avatar_url: 'avatar',
    };
    const res = {on: (event, callback) => callback(JSON.stringify(details))};
    sinon.replace(https, 'request', (options, cb) => cb(res));
    request(app)
      .get('/callback?code=somecode')
      .expect(302)
      .expect('location', '/', done);
  });
});

describe('hasFields', () => {
  it('should give 400 if required fields not present for /publish', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: false};
      next();
    });
    request(app)
      .post('/user/publish')
      .expect(400)
      .expect({error: 'Required fields not present'}, done);
  });
});

describe('serveNotFound', () => {
  it('should respond with not found for invalid url', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: false};
      next();
    });
    request(app).post('/abc').expect(404, done);
  });
});
