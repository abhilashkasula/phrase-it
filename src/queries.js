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

const getDraft = (authorId, storyId) =>
  `SELECT * FROM stories
    WHERE id = ${storyId} AND created_by = ${authorId} AND is_published = 0`;

const publish = (id) => {
  return `BEGIN;
    UPDATE stories set is_published = 1 where id = ${id};
    INSERT INTO published_stories (story_id, published_at)
      VALUES (${id}, DATETIME('now', 'localtime'));
    END;`;
};

const getPublishedStories = () =>
  `SELECT s.id,s.content,s.title,s.created_by,ps.published_at
              FROM stories s join published_stories ps
             on s.id=ps.id WHERE is_published = 1`;

module.exports = {
  insertNewStory,
  saveStory,
  getDrafts,
  insertUser,
  getUserDetails,
  getDraft,
  publish,
  getPublishedStories
};
