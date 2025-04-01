import promisePool from '../config/db.config.js';
import * as createUsersTable from './20240101000000_create_users_table.js';

const migrations = [
  createUsersTable
];

export const createMigrationsTable = async () => {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Failed to create migrations table:', error);
    throw error;
  }
};

export const getMigratedFiles = async () => {
  try {
    const [rows] = await promisePool.query('SELECT name FROM migrations');
    return rows.map(row => row.name);
  } catch (error) {
    console.error('Failed to get migrated files:', error);
    throw error;
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

export const runMigrations = async () => {
  try {
    await createMigrationsTable();
    const migratedFiles = await getMigratedFiles();

    for (const migration of migrations) {
      const migrationName = migration.name || 'unknown';
      if (!migratedFiles.includes(migrationName)) {
        console.log(`Running migration: ${migrationName}`);
        await migration.up();
        await recordMigration(migrationName);
        console.log(`Completed migration: ${migrationName}`);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}; 