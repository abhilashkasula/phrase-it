class Database {
  constructor(db) {
    this.users = db('users').select();
  }

  addUser({id, name, avatar_url}) {
    return new Promise((resolve) => {
      this.users
        .clone()
        .insert({id, username: name, avatar_url})
        .then(resolve({status: 'Added user'}));
    });
  }
}

module.exports = Database;
