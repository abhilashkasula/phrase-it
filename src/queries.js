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
             on s.id=ps.story_id`;

const getPublishedStory = (id) => {
  return `SELECT t1.id,
    t1.title,
    t3.username as author,
    t3.avatar_url,
    t1.content,
    t2.published_at,
    t2.views 
    FROM stories t1 
    JOIN published_stories t2 on t1.id = t2.story_id
    JOIN users t3 on t1.created_by = t3.id 
    WHERE t1.id = ${id}`;
};

const getUserPublishedStories = (userId) =>
  `SELECT t1.id,
    t1.content,
    t1.title,
    t2.published_at
  FROM stories t1 JOIN published_stories t2 ON t1.id = t2.story_id
  WHERE is_published = 1 AND t1.created_by = ${userId}`;

module.exports = {
  insertNewStory,
  saveStory,
  getDrafts,
  insertUser,
  getUserDetails,
  getDraft,
  publish,
  getPublishedStories,
  getPublishedStory,
  getUserPublishedStories
};
