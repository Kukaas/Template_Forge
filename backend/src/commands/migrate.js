import dotenv from 'dotenv';
dotenv.config();

import { runMigrations } from '../migrations/migrationManager.js';

const migrate = async () => {
  try {
    console.log('Starting migrations...');
    await runMigrations();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate(); 