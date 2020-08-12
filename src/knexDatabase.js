const ONE = 1;
class Database {
  constructor(db) {
    this.users = db('users').select();
    this.stories = db('stories').select();
    this.publishedStories = db('published_stories').select();
    this.tags = db('tags').select();
    this.responses = db('responses').select();
    this.claps = db('claps').select();
    this.followers = db('followers').select();
  }

  async addUser({id, name, avatar_url}) {
    await this.users.clone().insert({id, username: name, avatar_url});
    return {status: 'Added user'};
  }

  async createStory(created_by, title, content) {
    const story = {created_by, title, content};
    const [id] = await this.stories.clone().insert(story);
    return id;
  }

  async updateStory(id, title, created_by, content) {
    const rowsCount = await this.stories
      .clone()
      .where({id, created_by, is_published: 0})
      .update({title, content});
    if (!rowsCount) {
      throw {error: 'No draft found'};
    }
    return {status: 'Updated'};
  }

  async getDraft(id, created_by) {
    const conditions = {id, created_by, is_published: 0};
    const [draft] = await this.stories.clone().select().where(conditions);
    if (!draft) {
      throw {error: 'No draft found'};
    }
    return draft;
  }

  async getDrafts(created_by) {
    return await this.stories
      .clone()
      .select()
      .where({created_by, is_published: 0})
      .orderBy('last_modified', 'desc');
  }

  async deleteDraft(id, created_by) {
    const conditions = {id, created_by, is_published: 0};
    const rowsCount = await this.stories.clone().where(conditions).del();
    if (!rowsCount) {
      throw {error: 'No draft found'};
    }
    return {status: 'Deleted'};
  }

  async getPublishedStory(id) {
    const [story] = await this.stories.clone().where({id, is_published: 1});
    return story;
  }

  async getUserPublishedStories(userId) {
    return await this.stories
      .clone()
      .innerJoin(
        'published_stories',
        'stories.id',
        'published_stories.story_id'
      )
      .select(
        'stories.id',
        'stories.content',
        'stories.title',
        'published_stories.published_at'
      )
      .where({created_by: userId, is_published: 1});
  }

  async addResponse(responded_on, responded_by, response) {
    const isStoryExist = await this.getPublishedStory(responded_on);
    if (!isStoryExist) {
      throw {error: 'No story found'};
    }
    await this.responses.clone().insert({responded_on, responded_by, response});
    return {status: 'Added response'};
  }

  async getResponses(responded_on) {
    const isStoryExist = await this.getPublishedStory(responded_on);
    if (!isStoryExist) {
      throw {error: 'No story found'};
    }
    return await this.responses.clone().where({responded_on});
  }

  async toggleClap(clapped_on, clapped_by) {
    const [clap] = await this.claps.clone().where({clapped_on, clapped_by});
    const [{clapsCount}] = await this.claps
      .clone()
      .where({clapped_on})
      .count('id', {as: 'clapsCount'});
    if (clap) {
      await this.claps.clone().where({clapped_on, clapped_by}).del();
      return {isClapped: false, clapsCount: clapsCount - ONE};
    }
    await this.claps.clone().insert({clapped_on, clapped_by});
    return {isClapped: true, clapsCount: clapsCount + ONE};
  }

  async clap(storyId, userId) {
    const story = await this.getPublishedStory(storyId);
    if (!story) {
      throw {error: 'No story found'};
    }
    if (story.created_by === userId) {
      throw {error: 'You cannot clap or unclap on your own story'};
    }
    return await this.toggleClap(storyId, userId);
  }

  async isFollower(follower_id, user_id) {
    const [isFollower] = await this.followers
      .clone()
      .where({follower_id, user_id});
    return Boolean(isFollower);
  }

  async followAuthor(follower_id, user_id) {
    if (follower_id === user_id) {
      throw {error: 'You cannot follow yourself'};
    }
    const [author] = await this.users.clone().where({id: user_id});
    if (!author) {
      throw {error: 'No author found'};
    }
    const isFollower = await this.isFollower(follower_id, user_id);
    if (isFollower) {
      throw {error: 'Already following'};
    }
    await this.followers.clone().insert({follower_id, user_id});
    return {status: 'Following'};
  }

  async unFollowAuthor(follower_id, user_id) {
    if (follower_id === user_id) {
      throw {error: 'You cannot unfollow yourself'};
    }
    const [author] = await this.users.clone().where({id: user_id});
    if (!author) {
      throw {error: 'No author found'};
    }
    const isFollower = await this.isFollower(follower_id, user_id);
    if (!isFollower) {
      throw {error: 'You are not a follower of this user'};
    }
    await this.followers.clone().where({follower_id, user_id}).del();
    return {status: 'Unfollowed'};
  }

  async updateViews(userId, story_id, created_by) {
    if (created_by !== userId) {
      return await this.publishedStories
        .clone()
        .where({story_id})
        .increment('views', ONE);
    }
    const [{views}] = await this.publishedStories
      .clone()
      .select('views')
      .where({story_id});
    return views;
  }

  async addTags(story_id, tags) {
    if (!tags.length) {
      return {status: 'Empty tags'};
    }
    await this.tags.clone().insert(tags.map((tag) => ({story_id, tag})));
    return {status: 'Added tags'};
  }

  async getTags(story_id) {
    const tags = await this.tags.clone().where({story_id});
    return tags.map(({tag}) => tag);
  }

  async getFollowersEntries(conditions) {
    return await this.followers
      .clone()
      .leftJoin('users', 'followers.user_id', 'users.id')
      .where(conditions)
      .select('username', 'avatar_url', 'users.id');
  }

  async getUserDetails(id) {
    const [userDetails] = await this.users.clone().where({id});
    if (!userDetails) {
      throw {error: 'No user found'};
    }
    userDetails.followers = await this.getFollowersEntries({user_id: id});
    userDetails.following = await this.getFollowersEntries({follower_id: id});
    userDetails.stories = await this.getUserPublishedStories(id);
    return userDetails;
  }

  async matchingStories(keyword, fieldName) {
    return await this.stories
      .clone()
      .innerJoin('published_stories as t2', 'stories.id', 't2.story_id')
      .innerJoin('users as t3', 'stories.created_by', 't3.id')
      .innerJoin('tags as t4', 'stories.id', 't4.story_id')
      .where(fieldName, 'like', `%${keyword}%`)
      .groupBy('stories.id')
      .orderBy('published_at', 'desc')
      .select(
        'stories.id',
        'title',
        'content',
        'published_at',
        'username as author',
        't3.id as author_id'
      );
  }

  async search(keyword) {
    if (!keyword) {
      throw {error: 'Invalid keyword'};
    }
    const authorBased = await this.matchingStories(keyword, 'username');
    const contentBased = await this.matchingStories(keyword, 'title');
    const tagBased = await this.matchingStories(keyword, 'tag');
    return {authorBased, contentBased, tagBased};
  }
}

module.exports = Database;
