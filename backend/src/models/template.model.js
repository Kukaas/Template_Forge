import promisePool from '../config/db.config.js';

class Template {
  static async create(templateData) {
    const { title, description, category, mainCategory, filePath, fileName, fileType, fileSize, createdBy } = templateData;
    const [result] = await promisePool.query(
      `INSERT INTO templates (title, description, category, main_category, file_path, file_name, file_type, file_size, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, mainCategory, filePath, fileName, fileType, fileSize, createdBy]
    );
    return result.insertId;
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

    query += ' ORDER BY created_at DESC';

    const [rows] = await promisePool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await promisePool.query('SELECT * FROM templates WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, templateData) {
    const [result] = await promisePool.query(
      'UPDATE templates SET title = ?, description = ?, category = ?, main_category = ?, file_path = ?, file_name = ?, file_type = ?, file_size = ? WHERE id = ?',
      [
        templateData.title,
        templateData.description,
        templateData.category,
        templateData.mainCategory,
        templateData.filePath,
        templateData.fileName,
        templateData.fileType,
        templateData.fileSize,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await promisePool.query('DELETE FROM templates WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async incrementDownloads(id) {
    await promisePool.query(
      'UPDATE templates SET downloads = downloads + 1 WHERE id = ?',
      [id]
    );
  }
}

export default Template; 