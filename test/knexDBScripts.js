const sampleData = require('./sampleData.json');
const tables = require('./tableNames');

const clearDB = async (knex, tables) =>
  await tables.forEach(async (table) => await knex.truncate(table));

const populateDB = async (knex, tables) =>
  await tables.forEach(
    async (table) => await knex(table).insert(sampleData[table])
  );

const resetKnexDB = async (knex) => {
  await clearDB(knex, tables);
  await populateDB(knex, tables);
};

module.exports = {resetKnexDB};
