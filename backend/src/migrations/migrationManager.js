import promisePool from '../config/db.config.js';
import * as createUsersTable from './20240101000000_create_users_table.js';
import * as createTemplatesTable from './20240101000001_create_templates_table.js';
import * as addPremiumToUsers from './20240101000003_add_premium_to_users.js';
import * as createSubscriptionsTable from './20240101000004_create_subscriptions_table.js';
import * as createSavedTemplatesTable from './20240101000005_create_saved_templates_table.js';
import * as createCopiedTemplatesTable from './20240101000006_create_copied_templates_table.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  createUsersTable,
  addPremiumToUsers,
  createTemplatesTable,
  createSubscriptionsTable,
  createSavedTemplatesTable,
  createCopiedTemplatesTable,
];

const checkEnvironment = () => {
  if (!process.env.DB_NAME) {
    throw new Error('DB_NAME environment variable is not set');
  }
};

export const createMigrationsTable = async () => {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Migrations table created/verified');
  } catch (error) {
    console.error('Failed to create migrations table:', error);
    throw error;
  }
};

export const getMigratedFiles = async () => {
  try {
    // First check if migrations table exists
    const [tables] = await promisePool.query(`
      SELECT TABLE_NAME
      FROM information_schema.tables
      WHERE table_schema = '${process.env.DB_NAME}'
      AND table_name = 'migrations'
    `);

    if (tables.length === 0) {
      return []; // Return empty array if migrations table doesn't exist
    }

    const [rows] = await promisePool.query('SELECT name FROM migrations');
    return rows.map(row => row.name);
  } catch (error) {
    console.error('Failed to get migrated files:', error);
    return []; // Return empty array on error
  }
};

export const recordMigration = async (migrationName) => {
  try {
    await promisePool.query('INSERT INTO migrations (name) VALUES (?)', [migrationName]);
  } catch (error) {
    console.error('Failed to record migration:', error);
    throw error;
  }
};

export const runMigrations = async (isFresh = false) => {
  try {
    checkEnvironment();

    if (isFresh) {
      console.log('Dropping all tables...');
      await promisePool.query('SET FOREIGN_KEY_CHECKS = 0');
      const [tables] = await promisePool.query(`
        SELECT TABLE_NAME
        FROM information_schema.tables
        WHERE table_schema = '${process.env.DB_NAME}'
        AND table_type = 'BASE TABLE'
      `);

      for (const table of tables) {
        await promisePool.query(`DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``);
        console.log(`Dropped table: ${table.TABLE_NAME}`);
      }
      await promisePool.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    await createMigrationsTable();
    const migratedFiles = await getMigratedFiles();

    // Run pending migrations
    for (const migration of migrations) {
      if (!migration.name) {
        console.warn('Migration name not found, skipping...');
        continue;
      }

      if (!migratedFiles.includes(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        await migration.up();
        await recordMigration(migration.name);
        console.log(`Completed migration: ${migration.name}`);
      }
    }

    // Update super admin after all migrations
    await promisePool.query(`
      UPDATE users
      SET role = 'super_admin', is_premium = true
      WHERE email = 'senku8ypvrgjgy@gmail.com'
    `);

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};