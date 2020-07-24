const insertNewStory = (id, author, title, content) => {
  return `INSERT INTO stories (id, title, created_by, content, last_modified)
  VALUES
  (${id}, '${title}', '${author}', '${content}', DATETIME('now', 'localtime'))`;
};

const saveStory = (id, title, content) => {
  return `UPDATE stories
    SET title = '${title}',
      content = '${content}',
      last_modified = DATETIME('now', 'localtime')
      WHERE id = ${id};`;
};

const insertUser = (id, name, avatar_url) => {
  return `insert into users (id,username,avatar_url) 
                 values (${id},"${name}","${avatar_url}")`;
};

const getUserDetails = (id) => {
  return `select username,avatar_url from users where id=${id}`;
};

const getDrafts = (userId) =>
  `SELECT * FROM stories WHERE is_published = 0 AND created_by = ${userId}`;

const getStory = (authorId, storyId) =>
  `SELECT * FROM stories WHERE id = ${storyId} AND created_by = ${authorId}`;

module.exports = {
  insertNewStory,
  saveStory,
  getDrafts,
  insertUser,
  getUserDetails,
  getStory,
};
