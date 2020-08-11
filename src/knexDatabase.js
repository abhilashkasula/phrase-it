class Database {
  constructor(db) {
    this.users = db('users').select();
    this.stories = db('stories').select();
    this.tags = db('tags').select();
    this.responses = db('responses').select();
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

  async addResponse(responded_on, responded_by, response) {
    const conditions = {id: responded_on, is_published: 1};
    const [story] = await this.stories.clone().where(conditions);
    if (!story) {
      throw {error: 'Unknown id'};
    }
    await this.responses.clone().insert({responded_on, responded_by, response});
    return {status: 'Added response'};
  }
}

module.exports = Database;
