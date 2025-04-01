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
      // Set is_premium to true if the user is a super_admin
      const isPremium = role === 'super_admin';

      const [result] = await promisePool.query(
        'INSERT INTO users (id, email, name, avatar, provider, provider_id, role, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, email, name, avatar, provider, provider_id, role, isPremium]
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

  static async isUserPremium(userId) {
    try {
      const [rows] = await promisePool.query(
        'SELECT is_premium, role FROM users WHERE id = ?',
        [userId]
      );
      // Return true if user is either premium or super_admin
      return rows[0]?.role === 'super_admin' || rows[0]?.is_premium || false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      throw error;
    }
  }

  static async updatePremiumStatus(userId, isPremium) {
    try {
      const [user] = await promisePool.query(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );

      // If user is super_admin, don't allow changing premium status
      if (user[0]?.role === 'super_admin') {
        return true; // Already premium
      }

      await promisePool.query(
        'UPDATE users SET is_premium = ? WHERE id = ?',
        [isPremium, userId]
      );
      return true;
    } catch (error) {
      console.error('Error updating premium status:', error);
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

        // Update existing super admin if exists and set premium status
        await promisePool.query(`
          UPDATE users
          SET role = 'super_admin', is_premium = true
          WHERE email = 'senku8ypvrgjgy@gmail.com'
        `);
        console.log('Super admin role and premium status updated');
      } else {
        // Ensure all existing super_admin users are premium
        await this.ensureAdminsPremium();
      }
    } catch (error) {
      console.error('Error adding role column:', error);
      throw error;
    }
  }

  // New method to ensure all admins are premium
  static async ensureAdminsPremium() {
    try {
      await promisePool.query(`
        UPDATE users
        SET is_premium = true
        WHERE role = 'super_admin' AND is_premium = false
      `);
      console.log('Updated premium status for all admin users');
    } catch (error) {
      console.error('Error ensuring admins are premium:', error);
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
        is_premium BOOLEAN DEFAULT FALSE,
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