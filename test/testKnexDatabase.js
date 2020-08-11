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

  describe('getDrafts', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should give a list of drafts for the given user', (done) => {
      const expected = [
        {
          id: 2,
          title: '8 Ways to Build Virality into your Product',
          created_by: 58025056,
          content:
            '[{"type":"paragraph","data":{"text":"Computer science student."}}]',
          is_published: 0,
          last_modified: '2020-08-10 14:50:18',
        },
      ];

      db.getDrafts(58025056)
        .then((drafts) => {
          assert.deepStrictEqual(drafts, expected);
          done();
        })
        .catch((err) => done(err));
    });

    it('should give an empty list of drafts if user have no draft', (done) => {
      db.getDrafts(56071561)
        .then((drafts) => {
          assert.deepStrictEqual(drafts, []);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('createStory', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should create a new story and return the story id', (done) => {
      db.createStory(12345678, 'some title', '[]')
        .then((id) => {
          assert.strictEqual(id, 5);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('deleteDraft', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should delete the draft if draft is present', (done) => {
      db.deleteDraft(2, 58025056)
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Deleted'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if the draft is not present', (done) => {
      db.deleteDraft(10, 58025056)
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No draft found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('deleteDraft', () => {
    beforeEach(async () => await resetKnexDB(knexInstance));

    it('should delete the draft if draft is present', (done) => {
      db.updateStory(2, 'some title', 58025056, '[]')
        .then((res) => {
          assert.deepStrictEqual(res, {status: 'Updated'});
          done();
        })
        .catch((err) => done(err));
    });

    it('should reject if the draft is not present', (done) => {
      db.updateStory(1, 'some title', 58025056, '[]')
        .catch((err) => {
          assert.deepStrictEqual(err, {error: 'No draft found'});
          done();
        })
        .catch((err) => done(err));
    });
  });

  after(async () => await knexInstance.destroy());
});
