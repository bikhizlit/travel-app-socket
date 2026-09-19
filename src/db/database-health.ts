import { AppDataSource } from './data-source.js';

export async function checkDatabaseHealth() {
  if (!AppDataSource.isInitialized) {
    throw new Error('Database is not initialized');
  }

  await AppDataSource.query('SELECT 1');

  return true;
}