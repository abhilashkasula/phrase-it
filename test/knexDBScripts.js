const sampleData = require('./sampleData.json');

const clearDB = async (knex) => await knex.truncate('users');

const populateDB = async (knex) => await knex('users').insert(sampleData.users);

const resetKnexDB = async (knex) => {
  await clearDB(knex);
  await populateDB(knex);
};

module.exports = {resetKnexDB};
