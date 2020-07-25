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

  all(query) {
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  createStory(author) {
    return new Promise((resolve, reject) => {
      this.get('SELECT id FROM stories ORDER BY id DESC')
        .then((row) => {
          const id = row ? row.id + ONE : ONE;
          this.exec(queries.insertNewStory(id, author, '', '[]'))
            .then(() => resolve(id))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async updateStory(storyId, title, authorId, content) {
    const query = queries.saveStory(storyId, title, content);
    const row = await this.get(queries.getDraft(authorId, storyId));
    if (!row) {
      return {error: 'unknown id'};
    }
    await this.exec(query);
    return {status: 'updated'};
  }

  getDrafts(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(queries.getDrafts(userId), (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  addUser({id, name, avatar_url}) {
    return new Promise((resolve, reject) => {
      this.db.run(queries.insertUser(id, name, avatar_url), (err) => {
        if (err) {
          return reject(err);
        }
        resolve({status: 'added user'});
      });
    });
  }

  async getUserDetails(id) {
    return new Promise((resolve, reject) => {
      this.get(queries.getUserDetails(id)).then((userDetails) => {
        if (!userDetails) {
          return reject({error: 'unknown id'});
        }
        resolve(userDetails);
      });
    });
  }

  publish(authorId, storyId) {
    return new Promise((resolve, reject) => {
      this.get(queries.getDraft(authorId, storyId)).then((row) => {
        if (!row) {
          return reject({error: 'No draft found'});
        }
        this.exec(queries.publish(storyId))
          .then(() => resolve({status: 'published'}))
          .catch(() => reject({error: 'Already published'}));
      });
    });
  }

  getPublishedStories() {
    return new Promise((resolve, reject) => {
      this.db.all(queries.getPublishedStories(), (err, stories) => {
        if (err) {
          return reject(err);
        }
        resolve(stories);
      });
    });
  }

  getUserPublishedStories(userId) {
    return this.all(queries.getUserPublishedStories(userId));
  }

  getPublishedStory(id) {
    return this.get(queries.getPublishedStory(id));
  }
}

module.exports = Database;
