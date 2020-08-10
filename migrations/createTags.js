exports.up = function (knex) {
  return knex.schema.createTable('tags', (table) => {
    table.increments();
    table.integer('story_id').notNullable();
    table.text('tag').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tags');
};
