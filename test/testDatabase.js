const assert = require('assert');
const Database = require('../src/database');

describe('Unit Test', () => {
  describe('Database', () => {
    describe('get', () => {
      it('should reject when there is an error', async () => {
        const db = { get: (query, cb) => cb({ err: 'error' }) };
        const database = new Database(db);
        await assert.rejects(() => database.get('query'));
      });

      it('should resolve the row if there is no error', (done) => {
        const db = { get: (query, cb) => cb(null, { id: 1 }) };
        const database = new Database(db);
        database
          .get('query')
          .then((row) => {
            assert.deepStrictEqual(row, { id: 1 });
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('exec', () => {
      it('should reject when there is an error', async () => {
        const db = { exec: (query, cb) => cb({ err: 'error' }) };
        const database = new Database(db);
        await assert.rejects(() => database.exec('query'));
      });
      it('should resolve if there is no error', async () => {
        const db = { exec: (query, cb) => cb(null) };
        const database = new Database(db);
        await assert.doesNotReject(() => database.exec('query'));
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
          get: (query, cb) => cb(null, { id: 1 }),
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
          get: (query, cb) => cb({ err: 'error' }),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        await assert.rejects(() => database.createStory('John'));
      });

      it('should reject when there is error in inserting a story', async () => {
        const db = {
          get: (query, cb) => cb(null, { id: 1 }),
          exec: (query, cb) => cb({ err: 'error' }),
        };
        const database = new Database(db);
        await assert.rejects(() => database.createStory('John'));
      });
    });

    describe('updateStory', () => {
      it('should update the story with given title and content', (done) => {
        const db = {
          get: (query, cb) => cb(null, { id: 1 }),
          exec: (query, cb) => cb(null),
        };
        const database = new Database(db);
        database
          .updateStory(1, 'Title', 'John', 'Content')
          .then((result) => {
            assert.deepStrictEqual(result, { status: 'updated' });
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
            assert.deepStrictEqual(result, { error: 'unknown id' });
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('getDrafts', () => {
      it('should resolve all the drafts', (done) => {
        const db = { all: (query, cb) => cb(null, [{ id: 1 }]) };
        const database = new Database(db);
        database
          .getDrafts()
          .then((rows) => {
            assert.deepStrictEqual(rows, [{ id: 1 }]);
            done();
          })
          .catch((err) => done(err));
      });

      it('should reject when there is an error', async () => {
        const db = { all: (query, cb) => cb({ err: 'error' }) };
        const database = new Database(db);
        await assert.rejects(() => database.getDrafts());
      });
    });

    describe('addUser', () => {
      it('should resolve status added user if there is no error', (done) => {
        const db = { run: (query, cb) => cb() };
        const database = new Database(db);
        database
          .addUser('query').then((res) => {
            assert.strictEqual(res.status, 'added user');
            done();
          });
      });

      it('should reject error if there is  error', (done) => {
        const db = { run: (query, cb) => cb('Err') };
        const database = new Database(db);
        database
          .addUser('query').catch((err) => {
            assert.strictEqual(err, 'Err');
            done();
          });
      });
    });

    describe('getUserDetails', () => {
      it('should resolve userDetails if user is present', (done) => {
        const userDetails = { username: 'some one', avatar_url: 'avatar' };
        const db = { get: (query, cb) => cb(null, userDetails) };
        const database = new Database(db);
        database.getUserDetails(1).then((details) => {
          assert.strictEqual(details.username, 'some one');
          assert.strictEqual(details.avatar_url, 'avatar');
          done();
        });
      });

      it('should resolve userDetails if user is present', (done) => {
        const db = { get: (query, cb) => cb() };
        const database = new Database(db);
        database.getUserDetails(1).catch(({ error }) => {
          assert.strictEqual(error, 'unknown id');
          done();
        });
      });
    });
  });
});
