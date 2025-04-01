import { UserModel } from '../models/user.model.js';

export const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isSuperAdmin = await UserModel.isUserSuperAdmin(req.user.id);
    
    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 