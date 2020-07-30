const getPopulateQuery = () => {
  return `INSERT INTO users
values (
    58025056,
    'abhilashkasula',
    'https://avatars0.githubusercontent.com/u/58025056?v=4'
  ),
  (
    58025419,
    'myultimatevision',
    'https://avatars0.githubusercontent.com/u/58025419?v=4'
  ),
  (
    56071561,
    'anil-muraleedharan',
    'https://avatars2.githubusercontent.com/u/56071561?v=4'
  ),
  (
    58028408,
    'photongupta',
    'https://avatars0.githubusercontent.com/u/58028408?v=4'
  ),
  (
    58026402,
    'naveen-kumar-vadla',
    'https://avatars3.githubusercontent.com/u/58026402?v=4'
  ),
  (
    58026249,
    'venkybavisetti',
    'https://avatars2.githubusercontent.com/u/58026249?v=4'
  );
INSERT INTO stories (title, created_by, content, last_modified)
VALUES (
    '9 Ways to Build Virality into your Product',
    58025056,
    '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
    DATETIME('now', 'localtime')
  ),
  (
    '8 Ways to Build Virality into your Product',
    58025056,
    '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
    DATETIME('now', 'localtime')
  ),
  (
    '9 Ways to Build Virality into your Product',
    56071561,
    '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
    DATETIME('now', 'localtime')
  ),
  (
    '9 Ways to Build Virality into your Product',
    58028408,
    '[{"type":"paragraph","data":{"text":"I am a computer science student."}}]',
    DATETIME('now', 'localtime')
  ),
  (
    '',
    58025056,
    '[]',
    DATETIME('now', 'localtime')
  );
UPDATE stories
set is_published = 1
where id = 1
  or id = 3;
INSERT INTO published_stories (story_id, published_at)
VALUES (1, DATETIME('now', 'localtime')),
  (3, DATETIME('now', 'localtime'));
INSERT INTO claps (clapped_on, clapped_by)
VALUES (1, 58025419),
  (1, 56071561),
  (1, 58028408),
  (3, 58025056);
INSERT INTO responses (
    responded_on,
    responded_by,
    responded_at,
    response
  )
VALUES (
    1,
    58025419,
    DATETIME('now', 'localtime'),
    'Nice story'
  ),
  (
    1,
    58025056,
    DATETIME('now', 'localtime'),
    'Thanks Naagu'
  ),
  (
    1,
    58028408,
    DATETIME('now', 'localtime'),
    'Our app'
  ),
  (
    1,
    58026249,
    DATETIME('now', 'localtime'),
    'Nice story'
  );
INSERT INTO followers (user_id, follower_id)
VALUES (58025056, 58025419),
  (58025056, 56071561),
  (58025056, 58026249),
  (58025419, 58025056),
  (56071561, 58025419);
INSERT INTO tags (story_id, tag)
VALUES (1, 'technology'),
  (1, 'maths'),
  (1, 'science'),
  (1, 'thriller'),
  (1, 'sci-fi'),
  (3, 'comic');`;
};

const getCreateTablesQuery = () => {
  return `DROP TABLE IF EXISTS users;
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        avatar_url TEXT
      );
      DROP TABLE IF EXISTS stories;
      CREATE TABLE stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_published INTEGER DEFAULT 0,
        last_modified TIMESTAMP NOT NULL
      );
      DROP TABLE IF EXISTS published_stories;
      CREATE TABLE published_stories (
        story_id INTEGER PRIMARY KEY,
        published_at TIMESTAMP NOT NULL,
        views INTEGER DEFAULT 0
      );
      DROP TABLE IF EXISTS claps;
      CREATE TABLE claps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clapped_on INTEGER NOT NULL,
        clapped_by INTEGER NOT NULL
      );
      DROP TABLE IF EXISTS responses;
      CREATE TABLE responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        responded_on INTEGER NOT NULL,
        responded_by INTEGER NOT NULL,
        responded_at TIMESTAMP NOT NULL,
        response TEXT NOT NULL
      );
      DROP TABLE IF EXISTS followers;
      CREATE TABLE followers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        follower_id INTEGER NOT NULL
      );
      DROP TABLE IF EXISTS tags;
      CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        story_id INTEGER NOT NULL,
        tag TEXT NOT NULL
      );`;
};

const resetTables = (db) => {
  return new Promise((resolve) => {
    db.exec(getCreateTablesQuery()).then(() => {
      db.exec(getPopulateQuery()).then(() => resolve());
    });
  });
};

module.exports = {resetTables};
