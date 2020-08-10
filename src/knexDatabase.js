class Database {
  constructor(db) {
    this.users = db('users').select();
  }

  async addUser({id, name, avatar_url}) {
    await this.users.clone().insert({id, username: name, avatar_url});
    return {status: 'Added user'};
  }
}

module.exports = Database;
