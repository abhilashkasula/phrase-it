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
  `SELECT * FROM stories
    WHERE is_published = 0 AND created_by = ${userId}
    ORDER BY last_modified DESC`;

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

const getPublishedStories = () => {
  return `SELECT s.id,
          s.content,
          s.title,
          s.created_by,
          ps.published_at,
          u.username as author,
          u.avatar_url
          FROM stories s 
          join published_stories ps on s.id=ps.story_id
          JOIN users u on s.created_by = u.id `;
};

const getPublishedStoryDetails = (id) => {
  return `SELECT t1.id,
    t1.title,
    t3.username as author,
    t3.avatar_url,
    t3.id as authorId,
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
  WHERE is_published = 1 AND t1.created_by = ${userId}
  ORDER BY t2.published_at DESC`;

const getResponses = (storyId) =>
  `SELECT * FROM responses WHERE response_on = ${storyId}`;

const getResponsesCount = (storyId) =>
  `SELECT COUNT(*) AS count FROM responses WHERE response_on = ${storyId}`;

const addResponse = (storyId, userId, response) =>
  `INSERT INTO responses 
  (response_on, responded_by, responded_at, response)
  VALUES(${storyId}, ${userId},DATETIME('now', 'localtime'),'${response}');`;

const getPublishedStory = (storyId) =>
  `SELECT * FROM published_stories WHERE story_id = ${storyId}`;

const getFollower = (authorId, followerId) =>
  `SELECT * FROM followers
    WHERE user_id = ${authorId} AND follower_id = ${followerId}`;

const addFollower = (authorId, followerId) =>
  `INSERT INTO followers (user_id, follower_id)
    VALUES (${authorId}, ${followerId})`;

const followingStories = (userId) => 
  `WITH user_following as (
    SELECT * from followers where follower_id = ${userId}
  )
  SELECT t1.id,
    t1.title,
    t1.content,
    t2.published_at,
    t3.username author
  from stories t1 
  join published_stories t2 ON t1.id = t2.story_id 
  join users t3 ON t1.created_by = t3.id
  join user_following t4
    ON t1.created_by = t4.user_id OR t1.created_by = ${userId}
  ORDER BY t2.published_at DESC;`;

module.exports = {
  insertNewStory,
  saveStory,
  getDrafts,
  insertUser,
  getUserDetails,
  getDraft,
  publish,
  getPublishedStories,
  getPublishedStoryDetails,
  getUserPublishedStories,
  addResponse,
  getResponses,
  getResponsesCount,
  getPublishedStory,
  getFollower,
  addFollower,
  followingStories,
};
