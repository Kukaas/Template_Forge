import promisePool from '../config/db.config.js';

export const name = 'add_content_to_copied_templates';

export async function up() {
  try {
    await promisePool.query(`
      ALTER TABLE copied_templates
      ADD COLUMN content LONGTEXT,
      ADD COLUMN preview_url VARCHAR(255)
    `);
    console.log('Added content and preview_url columns to copied_templates table');
  } catch (error) {
    console.error('Error adding columns to copied_templates:', error);
    throw error;
  }
}

export async function down() {
  try {
    await promisePool.query(`
      ALTER TABLE copied_templates
      DROP COLUMN content,
      DROP COLUMN preview_url
    `);
    console.log('Dropped content and preview_url columns from copied_templates table');
  } catch (error) {
    console.error('Error dropping columns from copied_templates:', error);
    throw error;
  }
}