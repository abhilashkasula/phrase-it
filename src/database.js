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

  createStory(authorId, title, content) {
    return new Promise((resolve, reject) => {
      this.get('SELECT id FROM stories ORDER BY id DESC')
        .then((row) => {
          const id = row ? row.id + ONE : ONE;
          this.exec(queries.insertNewStory(id, authorId, title, content))
            .then(() => resolve(id))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async updateStory(storyId, title, authorId, content) {
    const query = queries.saveStory(storyId, title, content);
    const row = await this.getDraft(storyId, authorId);
    if (!row) {
      throw {error: 'No draft found'};
    }
    await this.exec(query);
    return {status: 'Story updated'};
  }

  getDrafts(userId) {
    return this.all(queries.getDrafts(userId));
  }

  addUser({id, name, avatar_url}) {
    return this.exec(queries.insertUser(id, name, avatar_url));
  }

  getUserDetails(id) {
    return new Promise((resolve, reject) => {
      this.get(queries.getUserDetails(id)).then((userDetails) => {
        if (!userDetails) {
          return reject({error: 'No user found'});
        }
        resolve(userDetails);
      });
    });
  }

  getDraft(draftId, authorId) {
    return this.get(queries.getDraft(authorId, draftId));
  }

  publish(authorId, storyId) {
    return new Promise((resolve, reject) => {
      this.getDraft(storyId, authorId).then((row) => {
        if (!row) {
          return reject({error: 'No draft found'});
        }
        if (!row.title.trim() && !JSON.parse(row.content).length) {
          const error = 'Cannot publish a story with empty title and content';
          return reject({error});
        }
        this.exec(queries.publish(storyId))
          .then(() => resolve({status: 'Published'}))
          .catch(() => reject({error: 'Already published'}));
      });
    });
  }

  getUserPublishedStories(userId) {
    return this.all(queries.getUserPublishedStories(userId));
  }

  async getPublishedStoryDetails(storyId, userId = 'NULL') {
    const storyDetails = await this.get(
      queries.getPublishedStoryDetails(storyId, userId)
    );
    if (!storyDetails) {
      throw {error: 'No story found'};
    }
    const {responsesCount} = await this.get(queries.getResponsesCount(storyId));
    const {clapsCount} = await this.get(queries.getClapsCount(storyId));
    const {isClapped} = await this.get(queries.isClapped(storyId, userId));
    const isAuthor = storyDetails.authorId === userId;
    const additionalFields = {responsesCount, clapsCount, isClapped, isAuthor};
    Object.assign(storyDetails, additionalFields);
    return storyDetails;
  }

  getResponses(storyId) {
    return new Promise((resolve, reject) => {
      this.get(queries.getPublishedStory(storyId))
        .then((story) => {
          if (!story) {
            return reject({error: 'unknown id'});
          }
          this.all(queries.getResponses(storyId)).then((responses) =>
            resolve(responses.reverse())
          );
        })
        .catch((err) => reject(err));
    });
  }

  async followAuthor(followerId, authorId) {
    if (followerId === authorId) {
      throw {error: 'You cannot follow yourself'};
    }
    const author = await this.get(queries.getUserDetails(authorId));
    if (!author) {
      throw {error: 'No author found'};
    }
    const follower = await this.get(queries.getFollower(authorId, followerId));
    if (follower) {
      throw {error: 'Already following'};
    }
    await this.exec(queries.addFollower(authorId, followerId));
    return {status: 'Following'};
  }

  getFollowingStories(userId) {
    return this.all(queries.followingStories(userId));
  }

  addResponse(storyId, userId, response) {
    return new Promise((resolve, reject) => {
      this.get(queries.getPublishedStory(storyId)).then((story) => {
        if (!story) {
          return reject({error: 'unknown id'});
        }
        this.exec(queries.addResponse(storyId, userId, response)).then(() =>
          resolve({status: 'added'})
        );
      });
    });
  }

  unFollowAuthor(followerId, authorId) {
    return new Promise((resolve, reject) => {
      this.get(queries.getFollower(authorId, followerId)).then((follower) => {
        if (!follower) {
          return reject({error: 'You are not a follower of this author'});
        }
        this.exec(queries.removeFollower(authorId, followerId)).then(() => {
          resolve({status: 'Unfollowed'});
        });
      });
    });
  }

  async clap(storyId, userId) {
    const story = await this.get(queries.getPublishedStory(storyId));
    if (!story) {
      throw {error: 'unknown id'};
    }
    const {isClapped} = await this.get(queries.isClapped(storyId, userId));
    let {clapsCount} = await this.get(queries.getClapsCount(storyId));
    if (isClapped) {
      await this.exec(queries.removeClap(storyId, userId));
      return {status: 'removed', clapsCount: --clapsCount};
    }
    await this.exec(queries.addClap(storyId, userId));
    return {status: 'added', clapsCount: ++clapsCount};
  }
}

module.exports = Database;
