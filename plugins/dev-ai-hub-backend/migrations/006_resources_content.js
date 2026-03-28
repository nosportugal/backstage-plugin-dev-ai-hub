/**
 * Add resources_content column to ai_assets.
 * Stores the content of bundled resource files for skills as JSON: { path: content }.
 */

exports.up = async function up(knex) {
  await knex.schema.table('ai_assets', table => {
    table.text('resources_content').nullable();
  });
};

exports.down = async function down(knex) {
  await knex.schema.table('ai_assets', table => {
    table.dropColumn('resources_content');
  });
};
