/**
 * Remove apply_to and model columns — these fields belong in the .md content,
 * not in the envelope. Only `resources` (used for skill zip downloads) stays.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.table('ai_assets', table => {
    table.dropColumn('apply_to');
    table.dropColumn('model');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.table('ai_assets', table => {
    table.text('apply_to');
    table.string('model');
  });
};
