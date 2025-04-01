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
      // Check if this is the super admin email
      const role = email === 'senku8ypvrgjgy@gmail.com' ? 'super_admin' : 'user';
      
      const [result] = await promisePool.query(
        'INSERT INTO users (id, email, name, avatar, provider, provider_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, email, name, avatar, provider, provider_id, role]
      );
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async isUserSuperAdmin(userId) {
    try {
      const [rows] = await promisePool.query(
        'SELECT role FROM users WHERE id = ? AND role = ?',
        [userId, 'super_admin']
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      throw error;
    }
  }

  static async addRoleColumn() {
    try {
      // Check if role column exists
      const [columns] = await promisePool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'role'
      `);

      // If role column doesn't exist, add it
      if (columns.length === 0) {
        await promisePool.query(`
          ALTER TABLE users 
          ADD COLUMN role VARCHAR(20) DEFAULT 'user'
        `);
        console.log('Role column added successfully');

        // Update existing super admin if exists
        await promisePool.query(`
          UPDATE users 
          SET role = 'super_admin' 
          WHERE email = 'senku8ypvrgjgy@gmail.com'
        `);
        console.log('Super admin role updated');
      }
    } catch (error) {
      console.error('Error adding role column:', error);
      throw error;
    }
  }
}

// Modify the createUsersTable function
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
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_provider_id (provider, provider_id)
      )
    `);
    console.log('Users table ready');
    
    // Add role column if it doesn't exist
    await UserModel.addRoleColumn();
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
};

export default UserModel; 