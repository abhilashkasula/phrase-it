exports.up = function (knex) {
  return knex.schema.createTable('responses', (table) => {
    table.increments();
    table.integer('responded_on').notNullable();
    table.integer('responded_by').notNullable();
    table.timestamp('responded_at').notNullable();
    table.text('response').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('responses');
};
