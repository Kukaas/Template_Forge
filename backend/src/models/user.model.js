import promisePool from '../config/db.config.js';
import { v4 as uuidv4 } from 'uuid';

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
        `SELECT u.is_premium, u.role,
         EXISTS(
           SELECT 1 FROM subscriptions s
           WHERE s.user_id = u.id
           AND s.status = 'active'
           AND s.end_date > NOW()
         ) as has_active_subscription
         FROM users u
         WHERE u.id = ?`,
        [userId]
      );

      // Return true if user is either super_admin or has an active subscription
      return rows[0]?.role === 'super_admin' || rows[0]?.has_active_subscription || false;
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

  static SUBSCRIPTION_PLANS = {
    monthly: {
      duration: 30, // days
      price: 3.99,
      savings: 0, // no savings for monthly
      description: 'Monthly Premium Access'
    },
    biannual: {
      duration: 180, // days (6 months)
      price: 19.99, // Instead of 23.94 (3.99 x 6)
      savings: 16.5, // About 16.5% savings
      description: '6 Months Premium Access'
    },
    yearly: {
      duration: 365, // days
      price: 35.99, // Instead of 47.88 (3.99 x 12)
      savings: 25, // 25% savings
      description: '12 Months Premium Access'
    }
  };

  static async createSubscription(userId, planType, paymentId) {
    try {
      // Validate plan type
      if (!this.SUBSCRIPTION_PLANS[planType]) {
        throw new Error('Invalid subscription plan');
      }

      // Calculate end date based on plan duration
      const plan = this.SUBSCRIPTION_PLANS[planType];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration);

      // Begin transaction
      const connection = await promisePool.getConnection();
      await connection.beginTransaction();

      try {
        // Create subscription record
        const subscriptionId = uuidv4();
        await connection.query(
          `INSERT INTO subscriptions (
            id, user_id, plan_type, amount, start_date, end_date, payment_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            subscriptionId,
            userId,
            planType,
            plan.price,
            startDate,
            endDate,
            paymentId
          ]
        );

        // Update user's premium status
        await connection.query(
          'UPDATE users SET is_premium = true WHERE id = ?',
          [userId]
        );

        await connection.commit();
        return {
          subscriptionId,
          planType,
          amount: plan.price,
          startDate,
          endDate
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async getCurrentSubscription(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT * FROM subscriptions
         WHERE user_id = ?
         AND status = 'active'
         AND end_date > NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting current subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(userId) {
    try {
      const connection = await promisePool.getConnection();
      await connection.beginTransaction();

      try {
        // Update subscription status
        await connection.query(
          `UPDATE subscriptions
           SET status = 'cancelled'
           WHERE user_id = ? AND status = 'active'`,
          [userId]
        );

        // Remove premium status
        await connection.query(
          'UPDATE users SET is_premium = false WHERE id = ?',
          [userId]
        );

        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Add method to check subscription status
  static async getSubscriptionStatus(userId) {
    try {
      const [subscription] = await promisePool.query(
        `SELECT
          plan_type,
          amount,
          start_date,
          end_date,
          status,
          DATEDIFF(end_date, NOW()) as days_remaining
         FROM subscriptions
         WHERE user_id = ?
         AND status = 'active'
         AND end_date > NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );

      if (!subscription[0]) {
        return {
          isSubscribed: false,
          subscription: null
        };
      }

      return {
        isSubscribed: true,
        subscription: subscription[0]
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  // Add a method to get plan details with savings information
  static async getSubscriptionPlans() {
    return {
      plans: Object.entries(this.SUBSCRIPTION_PLANS).map(([key, plan]) => ({
        id: key,
        type: key,
        price: plan.price,
        duration: plan.duration,
        description: plan.description,
        savings: plan.savings,
        pricePerMonth: Number((plan.price / (plan.duration / 30)).toFixed(2)),
        features: [
          'Access to all premium templates',
          'Priority support',
          'Ad-free experience',
          'Unlimited downloads'
        ]
      })),
      recommended: 'yearly' // Mark the best value plan
    };
  }

  static getFormattedPlanDetails(planType) {
    const plan = this.SUBSCRIPTION_PLANS[planType];
    if (!plan) return null;

    const monthlyEquivalent = Number((plan.price / (plan.duration / 30)).toFixed(2));
    const regularPrice = 3.99 * (plan.duration / 30); // Calculate non-discounted price
    const totalSavings = Number((regularPrice - plan.price).toFixed(2));

    return {
      ...plan,
      monthlyEquivalent,
      regularPrice,
      totalSavings,
      formattedPrice: `$${plan.price.toFixed(2)}`,
      formattedMonthly: `$${monthlyEquivalent.toFixed(2)}/mo`,
      savingsAmount: `$${totalSavings.toFixed(2)}`,
      savingsPercentage: `${plan.savings}%`
    };
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