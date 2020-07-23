const insertNewStory = (id, author, title, content) => {
  return `INSERT INTO stories (id, title, created_by, content, last_modified)
  VALUES
  (${id}, '${title}', '${author}', '${content}', DATETIME('now', 'localtime'))`;
};

const saveStory = (id, title, content) => {
  return `update stories
    set title = '${title}',
      content = '${content}',
      last_modified = DATETIME('now', 'localtime')
      where id = ${id};`;
};

module.exports = {insertNewStory, saveStory};
