class Database {
  constructor(db) {
    this.users = db('users').select();
    this.stories = db('stories').select();
  }

  async addUser({id, name, avatar_url}) {
    await this.users.clone().insert({id, username: name, avatar_url});
    return {status: 'Added user'};
  }

  async getDraft(draftId, authorId) {
    const conditions = {id: draftId, created_by: authorId, is_published: 0};
    const [draft] = await this.stories.clone().select().where(conditions);
    if (!draft) {
      throw {error: 'No draft found'};
    }
    return draft;
  }
}

module.exports = Database;
