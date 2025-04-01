import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import {
  saveTemplate,
  unsaveTemplate,
  getSavedTemplates,
  checkSavedStatus
} from '../controllers/savedTemplate.controller.js';

const router = express.Router();

router.post('/templates/:templateId/save', isAuthenticated, saveTemplate);
router.delete('/templates/:templateId/save', isAuthenticated, unsaveTemplate);
router.get('/templates/saved', isAuthenticated, getSavedTemplates);
router.get('/templates/:templateId/saved', isAuthenticated, checkSavedStatus);

export default router;