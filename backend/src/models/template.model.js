import promisePool from '../config/db.config.js';
import { v4 as uuidv4 } from 'uuid';

class Template {
  static async create(templateData) {
    console.log('Template data to be created:', templateData); // Debug log

    const {
      title,
      description,
      category,
      mainCategory,
      filePath,
      fileName,
      fileType,
      fileSize,
      createdBy,
      isPremium
    } = templateData;

    // Validate required fields
    if (!title || !category || !mainCategory || !filePath || !fileName || !fileType || !createdBy) {
      console.error('Missing required fields:', { title, category, mainCategory, filePath, fileName, fileType, createdBy });
      throw new Error('Missing required fields');
    }

    // Generate UUID for the template
    const id = uuidv4();

    try {
      const [result] = await promisePool.query(
        `INSERT INTO templates (
          id, title, description, category, main_category,
          file_path, file_name, file_type, file_size,
          created_by, is_premium
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          description,
          category,
          mainCategory,
          filePath,
          fileName,
          fileType,
          fileSize,
          createdBy,
          isPremium === true || isPremium === '1' || isPremium === 'true' ? 1 : 0
        ]
      );
      return id; // Return the UUID instead of insertId
    } catch (error) {
      console.error('Error in create template:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM templates';
    const params = [];

    if (filters.mainCategory) {
      query += ' WHERE main_category = ?';
      params.push(filters.mainCategory);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query += filters.mainCategory ? ' AND' : ' WHERE';
      query += ' (title LIKE ? OR description LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    if (filters.isPremium !== undefined) {
      query += filters.mainCategory || filters.search ? ' AND' : ' WHERE';
      query += ' is_premium = ?';
      params.push(filters.isPremium);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await promisePool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query('SELECT * FROM templates WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, templateData) {
    // If the data comes from FormData, it will be in the fields property
    const data = typeof templateData.fields === 'string'
      ? JSON.parse(templateData.fields)
      : templateData;

    const isPremiumValue = Boolean(data.isPremium) ? 1 : 0;
    console.log('Updating template with isPremium:', isPremiumValue, 'Original value:', data.isPremium);

    const [result] = await promisePool.query(
      `UPDATE templates SET
        title = ?,
        description = ?,
        category = ?,
        main_category = ?,
        file_path = ?,
        file_name = ?,
        file_type = ?,
        file_size = ?,
        is_premium = ?
      WHERE id = ?`,
      [
        data.title,
        data.description,
        data.category,
        data.mainCategory,
        data.filePath,
        data.fileName,
        data.fileType,
        data.fileSize,
        isPremiumValue,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    try {
      // First get the template to get the file path
      const [template] = await promisePool.query(
        'SELECT file_path FROM templates WHERE id = ?',
        [id]
      );

      if (template.length === 0) {
        return false;
      }

      // Delete from database
      const [result] = await promisePool.query(
        'DELETE FROM templates WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete template:', error);
      throw error;
    }
  }

  static async incrementDownloads(id) {
    await promisePool.query(
      'UPDATE templates SET downloads = downloads + 1 WHERE id = ?',
      [id]
    );
  }
}

export default Template;