import promisePool from '../config/db.config.js';

export const name = 'create_subscriptions_table';

export async function up() {
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      plan_type ENUM('monthly', 'biannual', 'yearly') NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP NULL,
      status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
      payment_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_status (user_id, status),
      CONSTRAINT fk_subscription_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('Subscriptions table created');
}

export async function down() {
  await promisePool.query('DROP TABLE IF EXISTS subscriptions');
  console.log('Subscriptions table dropped');
}