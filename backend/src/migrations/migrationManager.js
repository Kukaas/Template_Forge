import promisePool from '../config/db.config.js';
import * as createUsersTable from './20240101000000_create_users_table.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  createUsersTable
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

// New function to truncate all tables
export const truncateAllTables = async () => {
  try {
    // Disable foreign key checks temporarily
    await promisePool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables except migrations table
    const [tables] = await promisePool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME}'
      AND table_name != 'migrations'
      AND table_type = 'BASE TABLE'
    `);
    
    // Truncate each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      if (tableName) {
        await promisePool.query(`TRUNCATE TABLE \`${tableName}\``);
        console.log(`Truncated table: ${tableName}`);
      }
    }
    
    // Re-enable foreign key checks
    await promisePool.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Failed to truncate tables:', error);
    throw error;
  }
};

// New function to reset migrations
export const resetMigrations = async () => {
  try {
    await promisePool.query('TRUNCATE TABLE migrations');
    console.log('Reset migrations table');
  } catch (error) {
    console.error('Failed to reset migrations:', error);
    throw error;
  }
};

// Updated runMigrations to handle fresh option
export const runMigrations = async (fresh = false) => {
  try {
    checkEnvironment();
    await createMigrationsTable();
    
    if (fresh) {
      console.log('Running fresh migration - clearing all data...');
      await truncateAllTables();
      await resetMigrations();
    }

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

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}; 