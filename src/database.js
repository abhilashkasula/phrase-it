const queries = require('./queries');
const ONE = 1;

class Database {
  constructor(db) {
    this.db = db;
  }

  get(query) {
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  exec(query) {
    return new Promise((resolve, reject) => {
      this.db.exec(query, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  createStory(author) {
    return new Promise((resolve, reject) => {
      this.get('select id from stories order by id desc')
        .then((row) => {
          const id = row ? row.id + ONE : ONE;
          this.exec(queries.insertNewStory(id, author, '', ''))
            .then(() => resolve(id))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async saveNewStory(id, title, author, content) {
    const query = queries.saveStory(id, title, content);
    const row = await this.get(`select * from stories where id = ${id}`);
    if (!row) {
      return {error: 'unknown id'};
    }
    await this.exec(query);
    return {status: 'saved'};
  }

  getDrafts() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM stories', (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}

module.exports = Database;
