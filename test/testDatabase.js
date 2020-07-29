const assert = require('assert');
const Database = require('../src/database');

describe('Unit Test', () => {
  describe('Database', () => {
    describe('get', () => {
      it('should reject when there is an error', async () => {
        const db = {get: (query, cb) => cb({err: 'error'})};
        const database = new Database(db);
        await assert.rejects(() => database.get('query'));
      });

      it('should resolve the row if there is no error', (done) => {
        const db = {get: (query, cb) => cb(null, {id: 1})};
        const database = new Database(db);
        database
          .get('query')
          .then((row) => {
            assert.deepStrictEqual(row, {id: 1});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('exec', () => {
      it('should reject when there is an error', async () => {
        const db = {exec: (query, cb) => cb({err: 'error'})};
        const database = new Database(db);
        await assert.rejects(() => database.exec('query'));
      });
      it('should resolve if there is no error', async () => {
        const db = {exec: (query, cb) => cb(null)};
        const database = new Database(db);
        await assert.doesNotReject(() => database.exec('query'));
      });
    });

    describe('all', () => {
      it('should reject when there is an error', (done) => {
        const db = {all: (query, cb) => cb({error: 'error'})};
        const database = new Database(db);
        database
          .all('query')
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'error'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should resolve with rows when there is no error', (done) => {
        const db = {all: (query, cb) => cb(null, [{id: 1}])};
        const database = new Database(db);
        database
          .all('query')
          .then((err) => {
            assert.deepStrictEqual(err, [{id: 1}]);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('createStory', () => {
      it('should insert story and resolve story id for first story', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .createStory('John')
          .then((id) => {
            assert.strictEqual(id, 1);
            done();
          })
          .catch((err) => done(err));
      });

      it('should insert story and resolve id if story is present', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .createStory('John')
          .then((id) => {
            assert.strictEqual(id, 2);
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject when there is an error in getting id', async () => {
        const db = {
          get: (query, cb) => cb({err: 'error'}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        await assert.rejects(() => database.createStory('John'));
      });

      it('should reject when there is error in inserting a story', async () => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          exec: (query, cb) => cb({err: 'error'}),
        };
        const database = new Database(db);
        await assert.rejects(() => database.createStory('John'));
      });
    });

    describe('updateStory', () => {
      it('should update the story with given title and content', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .updateStory(1, 'Title', 'John', 'Content')
          .then((result) => {
            assert.deepStrictEqual(result, {status: 'updated'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should not update story and give error if id not found', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .updateStory(1, 'Title', 'John', 'Content')
          .then((result) => {
            assert.deepStrictEqual(result, {error: 'unknown id'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getDrafts', () => {
      it('should resolve all the drafts', (done) => {
        const db = {all: (query, cb) => cb(null, [{id: 1}])};
        const database = new Database(db);
        database
          .getDrafts()
          .then((rows) => {
            assert.deepStrictEqual(rows, [{id: 1}]);
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject when there is an error', async () => {
        const db = {all: (query, cb) => cb({err: 'error'})};
        const database = new Database(db);
        await assert.rejects(() => database.getDrafts());
      });
    });

    describe('addUser', () => {
      it('should resolve status added user if there is no error', (done) => {
        const db = {run: (query, cb) => cb()};
        const database = new Database(db);
        database.addUser('query').then((res) => {
          assert.strictEqual(res.status, 'added user');
          done();
        });
      });

      it('should reject error if there is  error', (done) => {
        const db = {run: (query, cb) => cb('Err')};
        const database = new Database(db);
        database.addUser('query').catch((err) => {
          assert.strictEqual(err, 'Err');
          done();
        });
      });
    });

    describe('getUserDetails', () => {
      it('should resolve userDetails if user is present', (done) => {
        const userDetails = {username: 'some one', avatar_url: 'avatar'};
        const db = {get: (query, cb) => cb(null, userDetails)};
        const database = new Database(db);
        database.getUserDetails(1).then((details) => {
          assert.strictEqual(details.username, 'some one');
          assert.strictEqual(details.avatar_url, 'avatar');
          done();
        });
      });

      it('should resolve userDetails if user is present', (done) => {
        const db = {get: (query, cb) => cb()};
        const database = new Database(db);
        database.getUserDetails(1).catch(({error}) => {
          assert.strictEqual(error, 'unknown id');
          done();
        });
      });
    });

    describe('publish', () => {
      const content = '[{type: "paragraph"}]';
      it('should resolve with status published for story found', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 5, title: 'Title', content}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .publish(1, 1)
          .then((result) => {
            assert.deepStrictEqual(result, {status: 'published'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the story already published', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 5, title: 'Title', content}),
          exec: (query, cb) => cb({err: 'not published'}),
        };
        const database = new Database(db);
        database
          .publish(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'Already published'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the draft not found to publish', (done) => {
        const db = {get: (query, cb) => cb(null, undefined)};
        const database = new Database(db);
        database
          .publish(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No draft found'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the title and content is empty', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 5, title: '', content: '[]'}),
        };
        const database = new Database(db);
        database
          .publish(1, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {
              error: 'Cannot publish a story with empty title and content',
            });
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getResponses', () => {
      const response = {
        id: 1,
        response_on: 1,
        responded_by: 1,
        responded_at: 'some time',
        response: 'response',
      };
      it('should give list of responses for existing story id', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 1}),
          all: (query, cb) => cb(null, [response]),
        };
        const database = new Database(db);
        database
          .getResponses(1)
          .then((res) => {
            assert.deepStrictEqual(res, [response]);
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject for unknown id', async () => {
        const db = {get: (query, cb) => cb({err: 'unknown id'})};
        const database = new Database(db);
        await assert.rejects(() => database.getResponses(100));
      });
    });

    describe('getDraft', () => {
      it('should resolve with draft for given draft id', (done) => {
        const draft = {id: 5, title: 'Title', content: '[]'};
        const db = {get: (query, cb) => cb(null, draft)};
        const database = new Database(db);
        database
          .getDraft(1, 1)
          .then((res) => {
            assert.deepStrictEqual(res, draft);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('followAuthor', () => {
      it('should resolve with status for following an author', (done) => {
        const db = {
          get: (query, cb) => {
            if (query.includes(58025419)) {
              return cb(null, undefined);
            }
            cb(null, {id: 58025419});
          },
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .followAuthor(58025419, 58025056)
          .then((res) => {
            assert.deepStrictEqual(res, {status: 'following'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject for following yourself', (done) => {
        const db = {};
        const database = new Database(db);
        database
          .followAuthor(58025419, 58025419)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'You cannot follow yourself'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject for following an author not present', (done) => {
        const db = {get: (query, cb) => cb(null, undefined)};
        const database = new Database(db);
        database
          .followAuthor(58025419, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'No author found'});
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject for following an author not present', (done) => {
        const db = {
          get: (query, cb) => {
            if (query.includes(58025419)) {
              return cb(null, {id: 58025419});
            }
            cb(null, {id: 1});
          },
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .followAuthor(58025419, 1)
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'Already following'});
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('addResponse', () => {
      it('should add response if the story is published', (done) => {
        const db = {
          get: (query, cb) => cb(null, {id: 2}),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .addResponse(2, 58025419, 'some response')
          .then((res) => {
            assert.deepStrictEqual(res, {status: 'added'});
            done();
          })
          .catch((err) => done(err));
      });
      it('should reject if the given story id is unknown', (done) => {
        const db = {
          get: (query, cb) => cb(null, undefined),
        };
        const database = new Database(db);
        database
          .addResponse(100, 58025419, 'response')
          .catch((err) => {
            assert.deepStrictEqual(err, {error: 'unknown id'});
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
