import promisePool from '../config/db.config.js';

export const name = 'add_premium_to_users';

export async function up() {
  await promisePool.query(`
    ALTER TABLE users
    ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false
  `);

  // Update existing null values to false
  await promisePool.query(`
    UPDATE users
    SET is_premium = false
    WHERE is_premium IS NULL
  `);

  console.log('Added premium column to users table');
}

export async function down() {
  await promisePool.query(`
    ALTER TABLE users
    DROP COLUMN is_premium
  `);
  console.log('Dropped premium column from users table');
}