import fs from 'fs';
import path from 'path';
import Template from '../models/template.model.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import UserModel from '../models/user.model.js';
import promisePool from '../config/db.config.js';
import { v4 as uuidv4 } from 'uuid';
import fsPromises from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all templates with optional filtering
export const getTemplates = async (req, res) => {
  try {
    const { mainCategory, search } = req.query;
    const templates = await Template.findAll({ mainCategory, search });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

// Get a single template by ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // First check copied templates
    const [copiedTemplate] = await promisePool.query(
      `SELECT ct.*,
              t.title as original_title,
              t.is_premium as original_is_premium
       FROM copied_templates ct
       LEFT JOIN templates t ON ct.original_template_id = t.id
       WHERE ct.id = ?`,
      [id]
    );

    if (copiedTemplate.length > 0) {
      // If it's a copied template, verify ownership
      if (copiedTemplate[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      return res.json({
        success: true,
        data: {
          ...copiedTemplate[0],
          file_path: `/uploads/copies/${copiedTemplate[0].file_name}`
        },
        type: 'copy'
      });
    }

    // If not found in copied_templates, check original templates
    const [template] = await promisePool.query(
      `SELECT t.*, u.name as creator_name
       FROM templates t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (!template.length) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user has access to premium template
    if (template[0].is_premium) {
      const [userStatus] = await promisePool.query(
        `SELECT is_premium, role FROM users WHERE id = ?`,
        [userId]
      );

      const hasAccess = userStatus.length > 0 &&
        (userStatus[0].is_premium || userStatus[0].role === 'super_admin');

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Premium template requires subscription'
        });
      }
    }

    res.json({
      success: true,
      data: template[0],
      type: 'original'
    });

  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting template',
      error: error.message
    });
  }
};

// Download template file
export const downloadTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if template is premium and user has premium access
    if (template.is_premium) {
      const isPremium = await UserModel.isUserPremium(req.user?.id);
      if (!isPremium) {
        return res.status(403).json({
          message: 'This is a premium template. Please upgrade your account to access it.'
        });
      }
    }

    // Check if file exists
    if (!fs.existsSync(template.file_path)) {
      return res.status(404).json({ message: 'Template file not found' });
    }

    // Get file stats
    const stat = fs.statSync(template.file_path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range request for streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(template.file_path, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': template.file_type,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Handle direct download
      const head = {
        'Content-Length': fileSize,
        'Content-Type': template.file_type,
        'Content-Disposition': `attachment; filename="${template.file_name}"`,
      };
      res.writeHead(200, head);
      fs.createReadStream(template.file_path).pipe(res);
    }

    // Update download count
    await Template.incrementDownloads(templateId);

  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ message: 'Error downloading template' });
  }
};

// Get template preview
export const getTemplatePreview = async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if file exists
    if (!fs.existsSync(template.file_path)) {
      return res.status(404).json({ message: 'Template file not found' });
    }

    // Get file extension
    const fileExt = path.extname(template.file_name).toLowerCase();

    // Handle different file types
    switch (fileExt) {
      case '.pdf':
        // For PDFs, send the file directly with appropriate headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(template.file_path).pipe(res);
        break;

      case '.doc':
      case '.docx':
      case '.xls':
      case '.xlsx':
      case '.ppt':
      case '.pptx':
        // For Office documents, send a preview page with premium blur effect
        const previewHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${template.title} - Preview</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                :root {
                  --primary: #007bff;
                  --primary-hover: #0056b3;
                  --bg: #ffffff;
                  --text: #333333;
                  --text-muted: #666666;
                  --border: #e5e7eb;
                }

                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }

                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  line-height: 1.5;
                  color: var(--text);
                  background: var(--bg);
                }

                .preview-container {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 1rem;
                }

                .preview-header {
                  margin-bottom: 2rem;
                  text-align: center;
                }

                .preview-header h1 {
                  font-size: clamp(1.5rem, 4vw, 2rem);
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                }

                .preview-header p {
                  color: var(--text-muted);
                  font-size: clamp(0.875rem, 2vw, 1rem);
                }

                .preview-content {
                  background: #f8f9fa;
                  border-radius: 0.5rem;
                  padding: clamp(1.5rem, 4vw, 2.5rem);
                  text-align: center;
                  position: relative;
                  overflow: hidden;
                }

                .preview-icon {
                  font-size: clamp(2rem, 6vw, 3rem);
                  margin-bottom: 1rem;
                  color: var(--text-muted);
                }

                .preview-text {
                  color: var(--text-muted);
                  margin-bottom: 1.5rem;
                  font-size: clamp(0.875rem, 2vw, 1rem);
                }

                .download-button {
                  display: inline-block;
                  padding: 0.75rem 1.5rem;
                  background: var(--primary);
                  color: white;
                  text-decoration: none;
                  border-radius: 0.375rem;
                  font-size: 0.875rem;
                  font-weight: 500;
                  transition: background-color 0.2s;
                }

                .download-button:hover {
                  background: var(--primary-hover);
                }

                .preview-scroll {
                  max-height: 60vh;
                  overflow-y: auto;
                  padding: 1rem;
                  background: white;
                  border-radius: 0.5rem;
                  margin-top: 1rem;
                  position: relative;
                }

                /* New styles for premium preview */
                .premium-content {
                  position: relative;
                }

                .premium-content::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(
                    to bottom,
                    transparent 0%,
                    rgba(255, 255, 255, 0.8) 70%,
                    rgba(255, 255, 255, 0.95) 100%
                  );
                  pointer-events: none;
                  z-index: 2;
                }

                .premium-content .content {
                  filter: blur(2px);
                  opacity: 0.8;
                }

                .premium-message {
                  position: absolute;
                  bottom: 20%;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(0, 0, 0, 0.8);
                  color: white;
                  padding: 1rem 2rem;
                  border-radius: 0.5rem;
                  z-index: 3;
                  text-align: center;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .premium-badge {
                  position: absolute;
                  top: 1rem;
                  right: 1rem;
                  background: linear-gradient(45deg, #FFD700, #FFA500);
                  color: white;
                  padding: 0.5rem 1rem;
                  border-radius: 0.375rem;
                  font-weight: 500;
                  z-index: 3;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 640px) {
                  .preview-container {
                    padding: 0.75rem;
                  }
                }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <div class="preview-header">
                  <h1>${template.title}</h1>
                  <p>${template.description}</p>
                </div>
                <div class="preview-content">
                  ${template.is_premium ? `
                    <div class="premium-badge">Premium Template</div>
                    <div class="premium-content">
                      <div class="content">
                        <p style="margin-bottom: 1rem;">This is a premium template preview.</p>
                        <p style="margin-bottom: 1rem;">The content includes professional formatting and structure.</p>
                        <p style="margin-bottom: 1rem;">Upgrade to premium to access the full template.</p>
                        <p style="margin-bottom: 1rem;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <p style="margin-bottom: 1rem;">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p style="margin-bottom: 1rem;">Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
                        <p style="margin-bottom: 1rem;">Laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <p style="margin-bottom: 1rem;">Duis aute irure dolor in reprehenderit in voluptate velit.</p>
                      </div>
                      <div class="premium-message">
                        🔒 Upgrade to Premium to Access Full Template
                      </div>
                    </div>
                  ` : `
                    <div class="preview-scroll">
                      <p style="margin-bottom: 1rem;">This is a preview of the template content.</p>
                      <p style="margin-bottom: 1rem;">Download the template to view the full content.</p>
                    </div>
                  `}
                  <a href="/api/templates/${templateId}/download" class="download-button">
                    ${template.is_premium ? 'Upgrade to Download' : 'Download Template'}
                  </a>
                </div>
              </div>
            </body>
          </html>
        `;
        res.setHeader('Content-Type', 'text/html');
        res.send(previewHtml);
        break;

      default:
        // For unsupported file types
        res.status(400).json({ message: 'Preview not available for this file type' });
    }
  } catch (error) {
    console.error('Error fetching template preview:', error);
    res.status(500).json({ message: 'Error fetching template preview' });
  }
};

export const createTemplate = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    console.log('Request file:', req.file); // Debug log
    console.log('User:', req.user); // Debug log

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const templateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      mainCategory: req.body.mainCategory,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      createdBy: req.user.id,
      isPremium: req.body.isPremium === '1' || req.body.isPremium === 'true'
    };

    console.log('Template data before creation:', templateData); // Debug log

    const templateId = await Template.create(templateData);
    res.status(201).json({ id: templateId, message: 'Template created successfully' });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      message: 'Error creating template',
      error: error.message
    });
  }
};

export const getSavedTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching saved templates for user:', userId); // Debug log

    const [rows] = await promisePool.query(
      `SELECT t.*, st.created_at as saved_at
       FROM saved_templates st
       JOIN templates t ON st.template_id = t.id
       WHERE st.user_id = ?
       ORDER BY st.created_at DESC`,
      [userId]
    );

    console.log('Found saved templates:', rows.length); // Debug log

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error getting saved templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting saved templates',
      error: error.message // Add error message for debugging
    });
  }
};

export const saveTemplate = async (req, res) => {
  try {
    const { id: templateId } = req.params;
    const userId = req.user.id;

    console.log('Saving template:', { userId, templateId }); // Debug log

    // Check if template exists
    const [template] = await promisePool.query(
      'SELECT id FROM templates WHERE id = ?',
      [templateId]
    );

    if (!template.length) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if already saved
    const [existing] = await promisePool.query(
      'SELECT id FROM saved_templates WHERE user_id = ? AND template_id = ?',
      [userId, templateId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Template already saved'
      });
    }

    // Save the template
    const [result] = await promisePool.query(
      'INSERT INTO saved_templates (id, user_id, template_id) VALUES (UUID(), ?, ?)',
      [userId, templateId]
    );

    console.log('Template saved successfully:', result); // Debug log

    res.status(201).json({
      success: true,
      message: 'Template saved successfully'
    });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving template',
      error: error.message // Add error message for debugging
    });
  }
};

export const unsaveTemplate = async (req, res) => {
  try {
    const { id: templateId } = req.params;
    const userId = req.user.id;

    console.log('Unsaving template:', { userId, templateId }); // Debug log

    const [result] = await promisePool.query(
      'DELETE FROM saved_templates WHERE user_id = ? AND template_id = ?',
      [userId, templateId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found in saved items'
      });
    }

    console.log('Template unsaved successfully:', result); // Debug log

    res.json({
      success: true,
      message: 'Template removed from saved items'
    });
  } catch (error) {
    console.error('Error removing saved template:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing template from saved items',
      error: error.message // Add error message for debugging
    });
  }
};

export const checkSavedStatus = async (req, res) => {
  try {
    const { id: templateId } = req.params;
    const userId = req.user.id;

    console.log('Checking saved status:', { userId, templateId }); // Debug log

    const [rows] = await promisePool.query(
      'SELECT id FROM saved_templates WHERE user_id = ? AND template_id = ?',
      [userId, templateId]
    );

    const isSaved = rows.length > 0;
    console.log('Template saved status:', isSaved); // Debug log

    res.json({
      success: true,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved status',
      error: error.message // Add error message for debugging
    });
  }
};

export const createTemplateCopy = async (req, res) => {
  try {
    const { id: templateId } = req.params;
    const userId = req.user.id;

    // First, get the original template
    const [template] = await promisePool.query(
      'SELECT * FROM templates WHERE id = ?',
      [templateId]
    );

    if (!template.length) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const originalTemplate = template[0];
    const newId = uuidv4();

    // Create new file path for the copy
    const fileExt = path.extname(originalTemplate.file_name);
    const newFileName = `${newId}${fileExt}`;
    const newFilePath = path.join('uploads', 'copies', newFileName);

    // Create copies directory if it doesn't exist
    await fsPromises.mkdir(path.join('uploads', 'copies'), { recursive: true });

    // Copy the actual file
    await fsPromises.copyFile(originalTemplate.file_path, newFilePath);

    // Create a copy record in the copied_templates table
    await promisePool.query(
      `INSERT INTO copied_templates (
        id, original_template_id, user_id, title, description,
        category, main_category, file_path, file_name,
        file_type, file_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        templateId,
        userId,
        `${originalTemplate.title} (Copy)`,
        originalTemplate.description,
        originalTemplate.category,
        originalTemplate.main_category,
        newFilePath,
        newFileName,
        originalTemplate.file_type,
        originalTemplate.file_size
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Template copy created successfully',
      data: {
        id: newId
      }
    });
  } catch (error) {
    console.error('Error creating template copy:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template copy',
      error: error.message
    });
  }
};

// Add new function to get user's copied templates
export const getCopiedTemplates = async (req, res) => {
  try {
    const userId = req.user.id;

    const [copiedTemplates] = await promisePool.query(
      `SELECT ct.*,
              t.title as original_title,
              t.description as original_description,
              t.is_premium as original_is_premium,
              t.file_path,
              t.file_name,
              DATE_FORMAT(ct.created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
              DATE_FORMAT(ct.last_edited, '%Y-%m-%dT%H:%i:%s.000Z') as last_edited
       FROM copied_templates ct
       LEFT JOIN templates t ON ct.original_template_id = t.id
       WHERE ct.user_id = ?
       ORDER BY ct.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: copiedTemplates.map(template => ({
        id: template.id,
        title: template.title || template.original_title,
        description: template.description || template.original_description,
        is_premium: template.original_is_premium,
        file_path: template.file_path,
        file_name: template.file_name,
        created_at: template.created_at,
        last_edited: template.last_edited,
        original_title: template.original_title,
        is_copy: true,
        category: template.category,
        main_category: template.main_category
      }))
    });

  } catch (error) {
    console.error('Error getting copied templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting copied templates',
      error: error.message
    });
  }
};

// Add function to update copied template
export const updateCopiedTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Verify ownership
    const [template] = await promisePool.query(
      'SELECT id FROM copied_templates WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!template.length) {
      return res.status(404).json({
        success: false,
        message: 'Copied template not found or access denied'
      });
    }

    // Update the template
    await promisePool.query(
      `UPDATE copied_templates
       SET title = ?, description = ?, category = ?
       WHERE id = ? AND user_id = ?`,
      [updates.title, updates.description, updates.category, id, userId]
    );

    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating copied template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

export const updateCopiedTemplateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, preview_url, title, description } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const [template] = await promisePool.query(
      'SELECT * FROM copied_templates WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!template.length) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    // Save the content and preview
    await promisePool.query(
      `UPDATE copied_templates
       SET content = ?,
           preview_url = ?,
           title = ?,
           description = ?,
           last_edited = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [content, preview_url, title, description, id]
    );

    res.json({
      success: true,
      message: 'Template content updated successfully'
    });

  } catch (error) {
    console.error('Error updating template content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template content',
      error: error.message
    });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { templateId, content, previewUrl, title, description } = req.body;
    const userId = req.user.id;
    const pdfFile = req.file;

    // First check if it's a copied template
    const [copiedTemplate] = await promisePool.query(
      'SELECT * FROM copied_templates WHERE id = ? AND user_id = ?',
      [templateId, userId]
    );

    if (copiedTemplate.length > 0) {
      // Update copied template with new PDF path and content
      await promisePool.query(
        `UPDATE copied_templates
         SET content = ?,
             preview_url = ?,
             title = ?,
             description = ?,
             file_path = ?,
             file_name = ?,
             last_edited = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [
          content,
          previewUrl,
          title,
          description,
          pdfFile ? `uploads/copies/${pdfFile.filename}` : copiedTemplate[0].file_path,
          pdfFile ? pdfFile.filename : copiedTemplate[0].file_name,
          templateId,
          userId
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Template updated successfully'
      });
    }

    // If not a copied template, check original templates
    const [originalTemplate] = await promisePool.query(
      'SELECT * FROM templates WHERE id = ? AND created_by = ?',
      [templateId, userId]
    );

    if (!originalTemplate.length) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this template'
      });
    }

    // Update original template
    await promisePool.query(
      `UPDATE templates
       SET content = ?,
           preview_url = ?,
           title = ?,
           description = ?,
           updated_at = NOW()
       WHERE id = ? AND created_by = ?`,
      [content, previewUrl, title, description, templateId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

export const deleteCopiedTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First get the template to get the file path
    const [template] = await promisePool.query(
      'SELECT * FROM copied_templates WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!template.length) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    // Delete the physical file
    const filePath = template[0].file_path;
    if (fs.existsSync(filePath)) {
      await fsPromises.unlink(filePath);
    }

    // Delete from database
    await promisePool.query(
      'DELETE FROM copied_templates WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting copied template:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

export const downloadCopiedTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const userId = req.user?.id;

    // Get the copied template
    const [copiedTemplate] = await promisePool.query(
      'SELECT * FROM copied_templates WHERE id = ? AND user_id = ?',
      [templateId, userId]
    );

    if (!copiedTemplate.length) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    const template = copiedTemplate[0];

    // Check if file exists
    if (!fs.existsSync(template.file_path)) {
      console.error('File not found:', template.file_path);
      return res.status(404).json({
        success: false,
        message: 'Template file not found'
      });
    }

    // Get file stats
    const stat = fs.statSync(template.file_path);
    const fileSize = stat.size;

    // Set response headers for download
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Type', template.file_type || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${template.title}.pdf"`);

    // Stream the file
    const fileStream = fs.createReadStream(template.file_path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading copied template:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading template',
      error: error.message
    });
  }
};