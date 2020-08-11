class Database {
  constructor(db) {
    this.users = db('users').select();
    this.stories = db('stories').select();
    this.tags = db('tags').select();
    this.responses = db('responses').select();
    this.claps = db('claps').select();
  }

  async addUser({id, name, avatar_url}) {
    await this.users.clone().insert({id, username: name, avatar_url});
    return {status: 'Added user'};
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

  async createStory(created_by, title, content) {
    const story = {created_by, title, content};
    const [id] = await this.stories.clone().insert(story);
    return id;
  }

  async deleteDraft(id, created_by) {
    const conditions = {id, created_by, is_published: 0};
    const rowsCount = await this.stories.clone().where(conditions).del();
    if (!rowsCount) {
      throw {error: 'No draft found'};
    }
    return {status: 'Deleted'};
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

  async getPublishedStory(id) {
    const [story] = await this.stories.clone().where({id, is_published: 1});
    return story;
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
    let [{clapsCount}] = await this.claps
      .clone()
      .where({clapped_on})
      .count('id', {as: 'clapsCount'});

    if (clap) {
      await this.claps.clone().where({clapped_on, clapped_by}).del();
      return {isClapped: false, clapsCount: --clapsCount};
    }
    await this.claps.clone().insert({clapped_on, clapped_by});
    return {isClapped: true, clapsCount: ++clapsCount};
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
}

module.exports = Database;
