import promisePool from '../config/db.config.js';

export const name = 'create_copied_templates_table';

export async function up() {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS copied_templates (
        id VARCHAR(36) PRIMARY KEY,
        original_template_id VARCHAR(36),
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        main_category ENUM('business', 'academic', 'resume') NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        content LONGTEXT,
        preview_url LONGTEXT,
        downloads INT DEFAULT 0,
        last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_copied_template_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_copied_template_original
          FOREIGN KEY (original_template_id)
          REFERENCES templates(id)
          ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_original_template (original_template_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created copied_templates table');
  } catch (error) {
    console.error('Error creating copied_templates table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await promisePool.query('DROP TABLE IF EXISTS copied_templates');
    console.log('Dropped copied_templates table');
  } catch (error) {
    console.error('Error dropping copied_templates table:', error);
    throw error;
  }
}