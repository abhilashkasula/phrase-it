exports.up = function (knex) {
  return knex.schema.createTable('claps', (table) => {
    table.increments();
    table.integer('clapped_on').notNullable();
    table.integer('clapped_by').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('claps');
};
