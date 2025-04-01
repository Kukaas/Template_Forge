import promisePool from '../config/db.config.js';

export const name = 'create_templates_table';

export async function up() {
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      main_category ENUM('business', 'academic', 'resume') NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      file_size INT NOT NULL,
      downloads INT DEFAULT 0,
      featured BOOLEAN DEFAULT false,
      is_premium TINYINT(1) NOT NULL DEFAULT 0,
      created_by VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('Templates table migration completed');
}

export async function down() {
  await promisePool.query(`DROP TABLE IF EXISTS templates`);
  console.log('Templates table dropped');
}