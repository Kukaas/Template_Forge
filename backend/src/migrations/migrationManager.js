import promisePool from '../config/db.config.js';
import * as createUsersTable from './20240101000000_create_users_table.js';
import * as createTemplatesTable from './20240101000001_create_templates_table.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  createUsersTable,
  createTemplatesTable
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

// Updated runMigrations to handle fresh option properly
export const runMigrations = async (isFresh = false) => {
  try {
    checkEnvironment();

    if (isFresh) {
      console.log('Dropping all tables...');
      // Drop all tables first
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

    // Create migrations table
    await createMigrationsTable();

    // Get list of already executed migrations
    const migratedFiles = await getMigratedFiles();

    // Run pending migrations
    for (const migration of migrations) {
      const migrationName = migration.name || 'unknown';
      if (!migratedFiles.includes(migrationName)) {
        console.log(`Running migration: ${migrationName}`);
        await migration.up();
        await recordMigration(migrationName);
        console.log(`Completed migration: ${migrationName}`);
      }
    }

    // Add role column migration
    await addRoleColumn();

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Updated addRoleColumn to be more robust
const addRoleColumn = async () => {
  const migrationName = 'add_role_column';
  
  try {
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
      AND TABLE_SCHEMA = '${process.env.DB_NAME}'
    `);

    if (columns.length === 0) {
      console.log('Adding role column to users table...');
      await promisePool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'user'
      `);

      // Update super admin role
      await promisePool.query(`
        UPDATE users 
        SET role = 'super_admin' 
        WHERE email = 'senku8ypvrgjgy@gmail.com'
      `);

      await recordMigration(migrationName);
      console.log('Added role column and updated super admin');
    }
  } catch (error) {
    console.error('Error in role column migration:', error);
    throw error;
  }
}; 