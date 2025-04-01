import promisePool from '../config/db.config.js';

export const name = 'create_saved_templates_table';

export async function up() {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS saved_templates (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        template_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_template (user_id, template_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created saved_templates table');
  } catch (error) {
    console.error('Error creating saved_templates table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await promisePool.query('DROP TABLE IF EXISTS saved_templates');
    console.log('Dropped saved_templates table');
  } catch (error) {
    console.error('Error dropping saved_templates table:', error);
    throw error;
  }
}