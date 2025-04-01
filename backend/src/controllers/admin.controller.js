import { UserModel } from '../models/user.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Template from '../models/template.model.js';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/templates';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common document formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, and PowerPoint files are allowed.'));
    }
  }
});

export const uploadTemplate = upload.single('file');

export const createTemplate = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);

    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        details: 'The file field is missing or empty in the request'
      });
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
      createdBy: req.user.id
    };

    console.log('Template data to be created:', templateData);

    const templateId = await Template.create(templateData);
    res.status(201).json({ 
      message: 'Template created successfully',
      templateId 
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ 
      message: 'Error creating template',
      error: error.message 
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const filters = {
      mainCategory: req.query.mainCategory,
      search: req.query.search
    };

    const templates = await Template.findAll(filters);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

export const getTemplate = async (req, res) => {
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

export const updateTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const existingTemplate = await Template.findById(templateId);
    
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      mainCategory: req.body.mainCategory,
    };

    // If a new file is uploaded
    if (req.file) {
      // Delete the old file
      try {
        fs.unlinkSync(existingTemplate.file_path);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }

      // Add new file information
      updateData.filePath = req.file.path;
      updateData.fileName = req.file.originalname;
      updateData.fileType = req.file.mimetype;
      updateData.fileSize = req.file.size;
    }

    const success = await Template.update(templateId, updateData);
    if (!success) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ 
      message: 'Template updated successfully',
      template: await Template.findById(templateId)
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ 
      message: 'Error updating template',
      error: error.message 
    });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Delete the file from storage
    fs.unlinkSync(template.file_path);

    const success = await Template.delete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Error deleting template' });
  }
};

export const getAdminDashboardData = async (req, res) => {
  try {
    // Add your super admin dashboard logic here
    res.json({
      success: true,
      message: "Super admin dashboard data",
      // Add more data as needed
    });
  } catch (error) {
    console.error('Error in admin dashboard:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}; 