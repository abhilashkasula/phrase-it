class Database {
  constructor(db) {
    this.users = db('users').select();
    this.stories = db('stories').select();
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
}

module.exports = Database;
