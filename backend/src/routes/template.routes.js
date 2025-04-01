import express from 'express';
import { 
  getTemplates, 
  getTemplateById, 
  downloadTemplate,
  getTemplatePreview 
} from '../controllers/template.controller.js';

const router = express.Router();

// Get all templates with optional filtering
router.get('/', getTemplates);

// Get a single template by ID
router.get('/:id', getTemplateById);

// Download template file
router.get('/:id/download', downloadTemplate);

// Get template preview
router.get('/:id/preview', getTemplatePreview);

export default router; 