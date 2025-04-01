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
  checkSavedStatus,
  createTemplateCopy,
  getCopiedTemplates,
  updateCopiedTemplate,
  updateCopiedTemplateContent,
  updateTemplate,
  deleteCopiedTemplate,
  downloadCopiedTemplate
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

// Update the PDF storage configuration
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/copies');
  },
  filename: (req, file, cb) => {
    // Get template ID and title from the request body
    const templateId = req.body.templateId;
    const title = req.body.title || 'template';
    // Create a safe filename
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = Date.now();
    cb(null, `${safeTitle}-${timestamp}.pdf`);
  }
});

const uploadPdf = multer({ storage: pdfStorage });

// Get all templates with optional filtering
router.get('/', getTemplates);

// Get saved templates
router.get('/saved', isAuthenticated, getSavedTemplates);

// Get copied templates
router.get('/copies', isAuthenticated, getCopiedTemplates);

// Update copied template
router.put('/copies/:id', isAuthenticated, updateCopiedTemplate);

// Get a single template
router.get('/:id', isAuthenticated, getTemplateById);

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

// Create a copy of a template
router.post('/:id/copy', isAuthenticated, createTemplateCopy);

// Update copied template content
router.put('/copies/:id/content', isAuthenticated, updateCopiedTemplateContent);

// Update template route
router.post('/update', isAuthenticated, uploadPdf.single('pdfFile'), updateTemplate);

// Add delete route for copied templates
router.delete('/copies/:id', isAuthenticated, deleteCopiedTemplate);

// Add this new route for downloading copied templates
router.get('/copies/:id/download', isAuthenticated, downloadCopiedTemplate);

export default router;