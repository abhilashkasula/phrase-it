const knex = require('knex');
const {assert} = require('chai');
const Database = require('../src/knexDatabase');
const knexConfig = require('../knexfile');
const {resetKnexDB} = require('./knexDBScripts');

const knexInstance = knex(knexConfig.test);
const db = new Database(knexInstance);

describe('knexDatabase', () => {
  describe('addUser', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should add a new user with given data', (done) => {
      const userData = {id: 12345678, name: 'some name', avatar_url: 'url'};
      db.addUser(userData)
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Added user'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('getDraft', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give draft if the draftId is proper', (done) => {
      const expected = {
        id: 2,
        title: '8 Ways to Build Virality into your Product',
        created_by: 58025056,
        content:
          '[{"type":"paragraph","data":{"text":"Computer science student."}}]',
        is_published: 0,
        last_modified: '2020-08-10 14:50:18',
      };

      db.getDraft(2, 58025056)
        .then((res) => {
          assert.deepStrictEqual(res, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give error if draftId is wrong', (done) => {
      db.getDraft(10, 58025056)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No draft found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  after(async () => await knexInstance.destroy());
});
