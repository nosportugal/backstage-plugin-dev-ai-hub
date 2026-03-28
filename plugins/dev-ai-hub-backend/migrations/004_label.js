/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.table('ai_assets', table => {
    table.string('label').nullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.table('ai_assets', table => {
    table.dropColumn('label');
  });
};
