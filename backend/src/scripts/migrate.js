import { runMigrations } from '../migrations/migrationManager.js';

const args = process.argv.slice(2);
const isFresh = args.includes('--fresh');

runMigrations(isFresh)
  .then(() => {
    console.log('Migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });