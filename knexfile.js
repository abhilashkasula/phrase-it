module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {filename: './database/phraseIt.db'},
  },

  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {filename: './test/database/testKnex.db'},
  },
};
