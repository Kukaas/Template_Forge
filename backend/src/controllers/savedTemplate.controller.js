import { UserModel } from '../models/user.model.js';

export const saveTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;

    const savedTemplate = await UserModel.saveTemplate(userId, templateId);
    res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: savedTemplate
    });
  } catch (error) {
    if (error.message === 'Template already saved') {
      return res.status(409).json({
        success: false,
        message: 'Template is already saved'
      });
    }
    console.error('Error saving template:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving template'
    });
  }
};

export const unsaveTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;

    const result = await UserModel.unsaveTemplate(userId, templateId);
    if (result) {
      res.json({
        success: true,
        message: 'Template removed from saved items'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Template was not found in saved items'
      });
    }
  } catch (error) {
    console.error('Error unsaving template:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing template from saved items'
    });
  }
};

export const getSavedTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const templates = await UserModel.getSavedTemplates(userId);
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting saved templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting saved templates'
    });
  }
};

export const checkSavedStatus = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;

    const isSaved = await UserModel.isTemplateSaved(userId, templateId);
    res.json({
      success: true,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved status'
    });
  }
};