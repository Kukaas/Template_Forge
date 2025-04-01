import fs from 'fs';
import path from 'path';
import Template from '../models/template.model.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Error fetching template' });
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
        // For Office documents, send a preview page
        const previewHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${template.title} - Preview</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: #f5f5f5;
                }
                .preview-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .preview-header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .preview-content {
                  text-align: center;
                  padding: 40px;
                  background: #f8f9fa;
                  border-radius: 4px;
                }
                .preview-icon {
                  font-size: 48px;
                  margin-bottom: 16px;
                  color: #666;
                }
                .preview-text {
                  color: #666;
                  margin-bottom: 20px;
                }
                .download-button {
                  display: inline-block;
                  padding: 8px 16px;
                  background: #007bff;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  transition: background 0.2s;
                }
                .download-button:hover {
                  background: #0056b3;
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
                  <div class="preview-icon">📄</div>
                  <div class="preview-text">
                    This is a ${fileExt.substring(1).toUpperCase()} file.<br>
                    Please download to view the full content.
                  </div>
                  <a href="/api/templates/${templateId}/download" class="download-button">
                    Download Template
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