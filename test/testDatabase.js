const assert = require('assert');
const Database = require('../src/database');

describe('Unit Test', () => {
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

  describe('createStory', () => {
    it('should insert story and resolve story id 1 for first story', (done) => {
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

    it('should insert story and resolve story id for story present', (done) => {
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
  });

  describe('updateStory', () => {
    it('should update the story with given title and content', (done) => {
      const db = {
        get: (query, cb) => cb(null, {id: 1}),
        exec: (query, cb) => cb(null),
      };
      const database = new Database(db);
      database.updateStory(1, 'Title', 'John', 'Content').then((result) => {
        assert.deepStrictEqual(result, {status: 'updated'});
        done();
      }).catch((err) => done(err));
    });
    it('should not update the story and give error if id not found', (done) => {
      const db = {
        get: (query, cb) => cb(null, undefined),
        exec: (query, cb) => cb(null),
      };
      const database = new Database(db);
      database.updateStory(1, 'Title', 'John', 'Content').then((result) => {
        assert.deepStrictEqual(result, {error: 'unknown id'});
        done();
      }).catch((err) => done(err));
    });
  });
});
