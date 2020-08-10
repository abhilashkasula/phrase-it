const knex = require('knex');
const {assert} = require('chai');
const Database = require('../src/knexDatabase');
const knexConfig = require('../knexfile');
const {resetKnexDB} = require('./knexDBScripts');

const knexInstance = knex(knexConfig.test);
const db = new Database(knexInstance);

describe('knexDatabase', () => {
  beforeEach(async () => await resetKnexDB(knexInstance));

  const userData = {id: 12345678, name: 'some name', avatar_url: 'url'};
  it('should add a new user with given data', (done) => {
    db.addUser(userData)
      .then((res) => {
        assert.deepStrictEqual(res, {status: 'Added user'});
        done();
      })
      .catch((err) => done(err));
  });

  after(async () => await knexInstance.destroy());
});
