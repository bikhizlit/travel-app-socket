import { AppDataSource } from './data-source.js';

export async function initializeDatabase() {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  await AppDataSource.initialize();

  console.log('Database connection established');

  return AppDataSource;
}