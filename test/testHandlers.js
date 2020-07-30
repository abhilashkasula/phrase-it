const request = require('supertest');
const https = require('https');
const sinon = require('sinon');
const {app} = require('../src/app');

describe('Integration tests', () => {
  describe('Handlers', () => {
    describe('unauthorized user', () => {
      before(() => {
        app.set('sessionMiddleware', (req, res, next) => {
          req.session = {isNew: true};
          next();
        });
      });
      it('should redirect to / for /newStory', (done) => {
        request(app).get('/newStory').expect(302).expect('location', '/', done);
      });
      it('should redirect to / for /updateStory', (done) => {
        request(app)
          .post('/updateStory')
          .expect(302)
          .expect('location', '/', done);
      });
      it('should redirect to / for /stories', (done) => {
        request(app).get('/stories').expect(302).expect('location', '/', done);
      });
      it('should redirect to / for /publish', (done) => {
        request(app).post('/publish').expect(302).expect('location', '/', done);
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
          .get('/responses?id=1')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(/response/, done);
      });
      it('should redirect to / for /edit', (done) => {
        request(app).get('/edit/1').expect(302).expect('location', '/', done);
      });
      it('should redirect to / for /dashboardStories', (done) => {
        request(app).get('/dashboardStories').expect('location', '/', done);
      });
      it('should redirect to / for /follow', (done) => {
        request(app).get('/follow').expect('location', '/', done);
      });
      it('should redirect to / for /clap', (done) => {
        request(app).get('/clap').expect('location', '/', done);
      });
    });

    describe('authorized user', () => {
      describe('newStory', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });

        it('should get the newStory page for authenticated user', (done) => {
          request(app)
            .get('/newStory')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/editor/, done);
        });
      });

      describe('updateStory', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });

        it('should update story title, content for given story id', (done) => {
          const block = {
            type: 'paragraph',
            data: {
              text: 'A small paragraph',
            },
          };
          const data = {id: 2, title: 'A new app', blocks: [block]};
          request(app)
            .post('/updateStory')
            .send(data)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Story updated'}, done);
        });

        it('should give 404 for updating story with unknown id', (done) => {
          request(app)
            .post('/updateStory')
            .send({id: 100, title: 'Title', blocks: ''})
            .expect(404)
            .expect('Content-Type', /json/)
            .expect({error: 'No draft found'}, done);
        });

        it('should create story & give back id if id not present', (done) => {
          const block = {
            type: 'paragraph',
            data: {
              text: 'A small paragraph',
            },
          };
          request(app)
            .post('/updateStory')
            .send({title: 'New blog', blocks: [block]})
            .expect(200)
            .expect('Content-Type', /json/, done);
        });
      });
      describe('stories', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });

        it('should give story page with available drafts of user', (done) => {
          request(app)
            .get('/stories')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/your stories/i, done);
        });

        it('should give unknown user id for user not found', (done) => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 10000};
            next();
          });
          request(app)
            .get('/stories')
            .expect(401)
            .expect('Content-Type', /json/)
            .expect({error: 'No user found'}, done);
        });
      });

      describe('publish', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });
        it('should publish a story present', (done) => {
          request(app)
            .post('/publish')
            .send({id: 2})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Published'}, done);
        });
        it('should give No draft found for no draft', (done) => {
          request(app)
            .post('/publish')
            .send({id: 2})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'No draft found'}, done);
        });
        it('should not publish a story with no content and title', (done) => {
          request(app)
            .post('/publish')
            .send({id: 5})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(
              {error: 'Cannot publish a story with empty title and content'},
              done
            );
        });
      });

      describe('/story', () => {
        it('should give story page if the story id is present', (done) => {
          request(app)
            .get('/story/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/story/i, done);
        });
        it('should give available options if the user is auth', (done) => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
          request(app)
            .get('/story/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/\/newStory/, done);
        });
        it('should give not found if the story id is absent', (done) => {
          request(app).get('/story/10').expect(404, done);
        });
      });

      describe('/edit', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58028408};
            next();
          });
        });
        it('should give draft editor page for /edit', (done) => {
          request(app)
            .get('/edit/6')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/publish/, done);
        });
        it('should give not found for /edit if draft is absent', (done) => {
          request(app)
            .get('/edit/1')
            .expect(404)
            .expect('Content-Type', /html/, done);
        });
      });

      describe('/draft', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58028408};
            next();
          });
        });
        it('should give the draft for given draft id present', (done) => {
          const expected = {
            draft: {
              id: 6,
              title: 'Title',
              created_by: 58028408,
              content: '[{"type":"paragraph","data":{"text":"Content1"}}]',
              is_published: 0,
              last_modified: '2020-07-24 15:22:33',
            },
          };
          request(app)
            .get('/draft/6')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(expected, done);
        });

        it('should give not found if given draft id not present', (done) => {
          request(app)
            .get('/draft/117')
            .expect('Content-Type', /json/)
            .expect({error: 'Draft not found'}, done);
        });
      });
      describe('/responses', () => {
        it('should give responses page for proper id', (done) => {
          request(app)
            .get('/responses?id=2')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(/response/, done);
        });
        it('should give badRequest for unknown id', (done) => {
          request(app)
            .get('/responses?id=100')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'unknown id'}, done);
        });
      });
      describe('/addResponse', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58028408};
            next();
          });
        });
        it('should add response for a published story id', (done) => {
          request(app)
            .post('/addResponse')
            .send({id: 2, response: 'some response'})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'added'}, done);
        });
        it('should give bad request for unknown id', (done) => {
          request(app)
            .post('/addResponse')
            .send({id: 100, response: 'some response'})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'unknown id'}, done);
        });
      });
      describe('/follow', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });
        it('should follow the author for a valid authorId', (done) => {
          request(app)
            .post('/follow')
            .send({authorId: 58026249})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Following'}, done);
        });
        it('should give error for following yourself', (done) => {
          request(app)
            .post('/follow')
            .send({authorId: 58025056})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'You cannot follow yourself'}, done);
        });
        it('should give error for following an invalid author', (done) => {
          request(app)
            .post('/follow')
            .send({authorId: 1})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'No author found'}, done);
        });
        it('should give err for following already following author', (done) => {
          request(app)
            .post('/follow')
            .send({authorId: 58025419})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'Already following'}, done);
        });
      });
      describe('/dashboardStories', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });
        it('should give the following and my stories', (done) => {
          request(app)
            .get('/dashboardStories')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(/A new app/, done);
        });
      });
      describe('/unFollow', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });
        it('should unfollow for given already following authorId', (done) => {
          request(app)
            .post('/unFollow')
            .send({authorId: 58025419})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'Unfollowed'}, done);
        });
        it('should give error for not following authorId given', (done) => {
          request(app)
            .post('/unFollow')
            .send({authorId: 56071561})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'You are not a follower of this author'}, done);
        });
      });

      describe('clap', () => {
        before(() => {
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {isNew: false, id: 58025056};
            next();
          });
        });
        it('should clap if the user have not clapped already', (done) => {
          request(app)
            .post('/clap')
            .send({id: 2})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'added', clapsCount: 1}, done);
        });
        it('should remove clap if the user clapped already', (done) => {
          request(app)
            .post('/clap')
            .send({id: 3})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect({status: 'removed', clapsCount: 0}, done);
        });
        it('should give bad request for unknown id', (done) => {
          request(app)
            .post('/clap')
            .send({id: 4})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect({error: 'unknown id'}, done);
        });
      });
    });
  });
});

describe('serveHomePage', () => {
  it('should get index page if session not exists', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: true};
      next();
    });
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/Login Using Github/, done);
  });

  it('should get welcome page if session not exists', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: false, id: 56071561};
      next();
    });
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/56071561/, done);
  });

  it('should give unknown user id for user not found', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: false, id: 10};
      next();
    });
    request(app)
      .get('/')
      .expect(401)
      .expect('Content-Type', /json/)
      .expect({error: 'No user found'}, done);
  });
});

describe('getUserDetails', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should redirect to / if there is no error', (done) => {
    const details = {
      access_token: 1234,
      id: 123,
      name: 'name',
      login: 'login',
      avatar_url: 'avatar',
    };
    const res = {
      on: (event, callback) => callback(JSON.stringify(details)),
    };
    sinon.replace(https, 'request', (options, cb) => cb(res));

    app.set('sessionMiddleware', (req, res, next) => {
      req.query = {code: 'somecode'};
      req.session = {};
      next();
    });
    request(app).get('/user').expect(302).expect('location', '/', done);
  });

  it('should redirect to / if query not exists', (done) => {
    const details = {
      access_token: 1234,
      id: 123,
      name: 'name',
      login: 'login',
      avatar_url: 'avatar',
    };
    const res = {
      on: (event, callback) => callback(JSON.stringify(details)),
    };
    sinon.replace(https, 'request', (options, cb) => cb(res));
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {};
      next();
    });
    request(app).get('/user').expect(302).expect('location', '/', done);
  });

  it('should give error if session not exists', (done) => {
    const details = {
      access_token: 1234,
      id: 123,
      name: 'name',
      login: 'login',
      avatar_url: 'avatar',
    };
    const res = {
      on: (event, callback) => callback(JSON.stringify(details)),
    };
    sinon.replace(https, 'request', (options, cb) => cb(res));
    app.set('sessionMiddleware', (req, res, next) => {
      req.query = {code: 'somecode'};
      next();
    });
    request(app).get('/user').expect(404, done);
  });

  it('should give error if user data is not present', (done) => {
    const details = {
      error: 'Err',
    };
    const res = {
      on: (event, callback) => callback(JSON.stringify(details)),
    };
    sinon.replace(https, 'request', (options, cb) => cb(res));

    app.set('sessionMiddleware', (req, res, next) => {
      req.query = {code: 'somecode'};
      req.session = {};
      next();
    });
    request(app).get('/user').expect(404, done);
  });

  it('should redirect to / if user name is absent', (done) => {
    const details = {
      access_token: 1234,
      id: 123,
      name: null,
      login: 'login',
      avatar_url: 'avatar',
    };
    const res = {
      on: (event, callback) => callback(JSON.stringify(details)),
    };
    sinon.replace(https, 'request', (options, cb) => cb(res));

    app.set('sessionMiddleware', (req, res, next) => {
      req.query = {code: 'somecode'};
      req.session = {};
      next();
    });
    request(app).get('/user').expect(302).expect('location', '/', done);
  });
});

describe('hasFields', () => {
  it('should give 400 if required fields not present for /publish', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: false};
      next();
    });
    request(app).post('/publish').expect(400, done);
  });
});

describe('notFound', () => {
  it('should respond with not found for invalid url', (done) => {
    app.set('sessionMiddleware', (req, res, next) => {
      req.session = {isNew: false};
      next();
    });
    request(app).post('/abc').expect(404, done);
  });
});
