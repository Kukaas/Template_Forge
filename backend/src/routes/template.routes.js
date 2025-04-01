import express from 'express';
import {
  getTemplates,
  getTemplateById,
  downloadTemplate,
  getTemplatePreview,
  createTemplate,
  saveTemplate,
  unsaveTemplate,
  getSavedTemplates,
  checkSavedStatus
} from '../controllers/template.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/templates');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all templates with optional filtering
router.get('/', getTemplates);

// Get saved templates - Move this before the :id routes to avoid conflict
router.get('/saved', isAuthenticated, getSavedTemplates);

// Get a single template by ID
router.get('/:id', getTemplateById);

// Download template file
router.get('/:id/download', isAuthenticated, downloadTemplate);

// Get template preview
router.get('/:id/preview', getTemplatePreview);

// Save/unsave template routes
router.post('/:id/save', isAuthenticated, saveTemplate);
router.delete('/:id/save', isAuthenticated, unsaveTemplate);
router.get('/:id/saved', isAuthenticated, checkSavedStatus);

// Create template route
router.post('/', upload.single('file'), createTemplate);

export default router;