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

const getDrafts = () => 'SELECT * FROM stories WHERE is_published = 0';

module.exports = {insertNewStory, saveStory, getDrafts};
