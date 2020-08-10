exports.up = function (knex) {
  return knex.schema.createTable('published_stories', (table) => {
    table.integer('story_id').primary();
    table.timestamp('published_at').defaultTo(knex.fn.now());
    table.text('cover_image_path');
    table.integer('views').defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('published_stories');
};
