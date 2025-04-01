import express from 'express';
import {
  getTemplates,
  getTemplateById,
  downloadTemplate,
  getTemplatePreview,
  createTemplate
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

// Get a single template by ID
router.get('/:id', getTemplateById);

// Download template file
router.get('/:id/download', isAuthenticated, downloadTemplate);

// Get template preview
router.get('/:id/preview', getTemplatePreview);

router.post('/templates', upload.single('file'), createTemplate);

export default router;