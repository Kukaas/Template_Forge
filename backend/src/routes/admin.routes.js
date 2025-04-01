import express from 'express';
import { isSuperAdmin } from '../middleware/auth.middleware.js';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  uploadTemplate
} from '../controllers/admin.controller.js';

const router = express.Router();

// Apply super admin middleware to all routes
router.use(isSuperAdmin);

// Template management routes
router.post('/templates', uploadTemplate, createTemplate);
router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplate);
router.put('/templates/:id', uploadTemplate, updateTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router; 