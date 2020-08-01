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

  async getUserDetails(id) {
    const userDetails = await this.get(queries.getUserDetails(id));
    if (!userDetails) {
      throw {error: 'No user found'};
    }
    userDetails.followers = await this.all(queries.getFollowers(id));
    userDetails.following = await this.all(queries.getFollowing(id));
    return userDetails;
  }

  getDraft(draftId, authorId) {
    return this.get(queries.getDraft(authorId, draftId));
  }

  addTags(id, tags) {
    return new Promise((resolve) => {
      if (!tags.length) {
        return resolve({error: 'No tags to add'});
      }
      this.exec(queries.addTags(id, tags)).then(() =>
        resolve({status: 'Added tags'})
      );
    });
  }

  publish(authorId, storyId, tags = []) {
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
          .then(() => {
            const status = 'Published';
            this.addTags(storyId, tags).then(() => resolve({status}));
          })
          .catch(() => reject({error: 'Already published'}));
      });
    });
  }

  getUserPublishedStories(userId) {
    return this.all(queries.getUserPublishedStories(userId));
  }

  async getPublishedStoryActivity(storyId, userId) {
    const {responsesCount} = await this.get(queries.getResponsesCount(storyId));
    const {clapsCount} = await this.get(queries.getClapsCount(storyId));
    const {isClapped} = await this.get(queries.isClapped(storyId, userId));
    const tags = await this.all(queries.getTags(storyId));
    return {responsesCount, clapsCount, isClapped, tags};
  }

  async getPublishedStoryDetails(storyId, userId = 'NULL') {
    const storyDetails = await this.get(
      queries.getPublishedStoryDetails(storyId, userId)
    );
    if (!storyDetails) {
      throw {error: 'No story found'};
    }
    const additional = await this.getPublishedStoryActivity(storyId, userId);
    additional.isAuthor = storyDetails.authorId === userId;
    Object.assign(storyDetails, additional);
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

  async toggleClap(storyId, userId) {
    const {isClapped} = await this.get(queries.isClapped(storyId, userId));
    let {clapsCount} = await this.get(queries.getClapsCount(storyId));
    if (isClapped) {
      await this.exec(queries.removeClap(storyId, userId));
      return {isClapped: false, clapsCount: --clapsCount};
    }
    await this.exec(queries.addClap(storyId, userId));
    return {isClapped: true, clapsCount: ++clapsCount};
  }

  async clap(storyId, userId) {
    const story = await this.get(queries.getPublishedStory(storyId));
    if (!story) {
      throw {error: 'No story found'};
    }
    if (story.created_by === userId) {
      throw {error: 'You cannot clap or unclap on your own story'};
    }
    return await this.toggleClap(storyId, userId);
  }

  async getTags(storyId) {
    const tags = await this.all(queries.getTags(storyId));
    return tags.map(({tag}) => tag);
  }

  async search(keyword) {
    if (keyword === undefined) {
      throw {error: 'invalid keyword'};
    }
    const authorBased = await this.all(queries.authorBasedSearch(keyword));
    const contentBased = await this.all(queries.contentBasedSearch(keyword));
    const tagBased = await this.all(queries.tagBasedSearch(keyword));
    const results = {authorBased, tagBased, contentBased};
    for (const type in results) {
      for (const story of results[type]) {
        story.tags = await this.getTags(story.id);
      }
    }
    return results;
  }

  async updateViews(userId, storyId, authorId) {
    if (authorId !== userId) {
      await this.exec(queries.updateViews(storyId));
    }
    return await this.get(queries.getStoryViews(storyId));
  }
}

module.exports = Database;
