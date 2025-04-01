import { Router } from 'express';
import { requireSuperAdmin } from '../middleware/superAdmin.middleware.js';
import { getAdminDashboardData } from '../controllers/admin.controller.js';

const router = Router();

router.get('/dashboard', requireSuperAdmin, getAdminDashboardData);

export default router; 