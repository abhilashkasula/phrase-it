const request = require('supertest');
const https = require('https');
const sinon = require('sinon');
const {app} = require('../src/app');
const {resetTables} = require('./dbScripts');

describe('Handlers', () => {
  describe('unauthorized user', () => {
    beforeEach(async () => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {isNew: true};
        next();
      });
      await resetTables(app.locals.db);
    });

    it('should give story page with login option', (done) => {
      request(app)
        .get('/story/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(/Login/, done);
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

    it('should give responses page for /responses', (done) => {
      request(app)
        .get('/responses/1')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(/response/, done);
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

    describe('/story', () => {
      beforeEach(async () => {
        app.set('sessionMiddleware', (req, res, next) => {
          req.session = {isNew: false, id: 58025056};
          next();
        });
        const stubGetPublishedStory = sinon.stub();
        const stubUpdateViews = sinon.stub();
        const stubIsFollowing = sinon.stub();
        app.locals.db.getPublishedStoryDetails = stubGetPublishedStory;
        app.locals.db.updateViews = stubUpdateViews;
        app.locals.db.isFollowing = stubIsFollowing;
        stubUpdateViews.withArgs(58025056, 1, 58025056).resolves(0);
        stubUpdateViews.withArgs(58025419, 1, 58025056).resolves(1);
        stubIsFollowing.withArgs(58025056, 58025056).resolves(0);
        stubIsFollowing.withArgs(58025419, 58025056).resolves(1);
        stubGetPublishedStory.withArgs('10').rejects({error: 'No story found'});
        stubGetPublishedStory.withArgs('1').resolves({
          id: 1,
          title: 'Hello',
          content: '[]',
          authorId: 58025056,
          tags: ['technology', 'maths'],
          views: 1,
        });
      });

      afterEach(() => sinon.restore());

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
          .expect(/0 Views/, done); //expecting views
      });

      it('should give not found if the story id is absent', (done) => {
        request(app).get('/story/10').expect(404, done);
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
