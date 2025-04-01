import promisePool from '../config/db.config.js';

export class UserModel {
  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async findByProviderId(provider, providerId) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        [provider, providerId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by provider:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { id, email, name, avatar, provider, provider_id } = userData;
      const [result] = await promisePool.query(
        'INSERT INTO users (id, email, name, avatar, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?)',
        [id, email, name, avatar, provider, provider_id]
      );
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

// Create users table if it doesn't exist
export const createUsersTable = async () => {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_provider_id (provider, provider_id)
      )
    `);
    console.log('Users table ready');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
};

export default UserModel; 