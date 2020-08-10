const {DB_NAME, KNEX_TEST_DB_NAME} = require('./config');

module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {filename: DB_NAME},
  },

  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {filename: KNEX_TEST_DB_NAME},
  },
};
