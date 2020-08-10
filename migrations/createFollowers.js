exports.up = function (knex) {
  return knex.schema.createTable('followers', (table) => {
    table.increments();
    table.integer('user_id').notNullable();
    table.integer('follower_id').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('followers');
};
