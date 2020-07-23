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
      database.get('query').then((row) => {
        assert.deepStrictEqual(row, {id: 1});
        done();
      });
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
});
