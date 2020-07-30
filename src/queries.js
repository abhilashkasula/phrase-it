const insertNewStory = (id, author, title, content) =>
  `INSERT INTO stories (id, title, created_by, content, last_modified) VALUES
  (${id}, '${title}', '${author}', '${content}', DATETIME('now', 'localtime'))`;

const saveStory = (id, title, content) =>
  `UPDATE stories
  SET title = '${title}',
    content = '${content}',
    last_modified = DATETIME('now', 'localtime')
  WHERE id = ${id};`;

const insertUser = (id, name, avatar_url) =>
  `INSERT INTO users (id,username,avatar_url) 
  VALUES (${id},'${name}','${avatar_url}')`;

const getUserDetails = (id) =>
  `SELECT username, avatar_url FROM users WHERE id=${id}`;

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

const getPublishedStoryDetails = (storyId, userId) =>
  `WITH user_following as 
    (SELECT * from followers where follower_id = ${userId})
  SELECT t1.id,
      t1.title,
      t3.username as author,
      t3.avatar_url,
      t3.id as authorId,
      t1.content,
      t2.published_at,
      t2.views,
      CASE WHEN t4.user_id = t3.id
        THEN 1
        ELSE 0
      END as is_following
      FROM stories t1 
      JOIN published_stories t2 on t1.id = t2.story_id
      JOIN users t3 on t1.created_by = t3.id 
      LEFT JOIN user_following t4 on t4.user_id = t3.id
      WHERE t1.id = ${storyId};`;

const getUserPublishedStories = (userId) =>
  `SELECT t1.id,
    t1.content,
    t1.title,
    t2.published_at
  FROM stories t1 JOIN published_stories t2 ON t1.id = t2.story_id
  WHERE is_published = 1 AND t1.created_by = ${userId}
  ORDER BY t2.published_at DESC`;

const getResponses = (storyId) =>
  `SELECT t1.response,
  t1.responded_at,
  t2.username,
  t2.avatar_url
  FROM responses t1
  LEFT JOIN
  users t2 on t1.responded_by = t2.id
  WHERE responded_on = ${storyId}`;

const getClapsCount = (storyId) =>
  `SELECT COUNT(*) AS clapsCount FROM claps WHERE clapped_on = ${storyId}`;

const isClapped = (storyId, userId) =>
  `SELECT EXISTS (
    SELECT 1 FROM claps
    WHERE clapped_on = ${storyId} 
    AND clapped_by = ${userId}) 
    as isClapped`;

const addClap = (storyId, userId) =>
  `INSERT INTO claps (clapped_on, clapped_by) VALUES(${storyId}, ${userId})`;

const removeClap = (storyId, userId) =>
  `DELETE FROM claps WHERE clapped_on = ${storyId} AND clapped_by = ${userId}`;

const getResponsesCount = (storyId) =>
  `SELECT COUNT(*) AS responsesCount 
  FROM responses WHERE responded_on = ${storyId}`;

const addResponse = (storyId, userId, response) =>
  `INSERT INTO responses 
  (responded_on, responded_by, responded_at, response)
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
  `WITH user_following as 
    (SELECT * from followers where follower_id = ${userId})
  SELECT t1.id,
    t1.title,
    t1.content,
    t2.published_at,
    t3.username author,
    t3.id authorId
  FROM stories t1 
  JOIN published_stories t2 ON t1.id = t2.story_id 
  JOIN users t3 ON t1.created_by = t3.id
  LEFT JOIN user_following t4
    ON t1.created_by = t4.user_id OR t1.created_by = ${userId}
    WHERE t3.id = ${userId} OR t4.user_id IS NOT NULL
    ORDER BY published_at DESC;`;

const removeFollower = (authorId, followerId) =>
  `DELETE FROM followers
    WHERE user_id = ${authorId} AND follower_id = ${followerId}`;

const getFollowers = (userId) =>
  `SELECT t2.username, t2.id 
  FROM followers t1
  JOIN users t2 ON t1.follower_id = t2.id
  AND t1.user_id = ${userId}`;

const getFollowing = (userId) =>
  `SELECT t2.username, t2.id 
  FROM followers t1
  JOIN users t2 ON t1.user_id = t2.id
  AND t1.follower_id = ${userId}`;

module.exports = {
  insertNewStory,
  saveStory,
  getDrafts,
  insertUser,
  getUserDetails,
  getDraft,
  publish,
  getPublishedStoryDetails,
  getUserPublishedStories,
  addResponse,
  getResponses,
  getResponsesCount,
  getClapsCount,
  isClapped,
  addClap,
  removeClap,
  getPublishedStory,
  getFollower,
  addFollower,
  followingStories,
  removeFollower,
  getFollowers,
  getFollowing,
};
