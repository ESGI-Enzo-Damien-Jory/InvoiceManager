/**
 * @file controllers/attachments/attachments.js
 * @module attachmentsController
 * @description Handles attachment-related operations including CRUD with user access control
 */

const pool = require('../../config/database');

const TABLE_NAME = 'Attachment';

/**
 * Creates a new attachment with user access check
 * @async
 * @param {Object} req - Request object containing attachment data
 * @param {Object} res - Response object
 */
async function createAttachment(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();
  try {
    const { invoice_id, file_name, file_data, extension } = req.body;

    const [invoiceCheck] = await connection.execute(
      'SELECT id FROM Invoice WHERE id = ? AND user_id = ?',
      [invoice_id, req.user.id]
    );

    if (invoiceCheck.length === 0) {
      return res
        .status(404)
        .json({ message: 'Invoice not found or access denied' });
    }

    const [result] = await connection.execute(
      `INSERT INTO ${TABLE_NAME} (invoice_id, file_name, file_data, extension)
       VALUES (?, ?, ?, ?)`,
      [invoice_id, file_name, file_data, extension]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Attachment created successfully',
    });
  } catch (error) {
    console.error('Error creating attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * Retrieves an attachment by ID with user access check
 * @async
 * @param {Object} req - Request object containing attachment ID
 * @param {Object} res - Response object
 */
async function getAttachmentById(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const [attachments] = await pool.execute(
      `SELECT a.* 
       FROM ${TABLE_NAME} a
       JOIN Invoice i ON a.invoice_id = i.id
       WHERE a.id = ? AND i.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (attachments.length === 0) {
      return res
        .status(404)
        .json({ message: 'Attachment not found or access denied' });
    }

    res.json(attachments[0]);
  } catch (error) {
    console.error('Error retrieving attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Deletes an attachment by ID with user access check
 * @async
 * @param {Object} req - Request object containing attachment ID
 * @param {Object} res - Response object
 */
async function deleteAttachment(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();
  try {
    const [attachmentCheck] = await connection.execute(
      `SELECT a.id 
       FROM ${TABLE_NAME} a
       JOIN Invoice i ON a.invoice_id = i.id
       WHERE a.id = ? AND i.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (attachmentCheck.length === 0) {
      return res
        .status(404)
        .json({ message: 'Attachment not found or access denied' });
    }

    const [result] = await connection.execute(
      `DELETE FROM ${TABLE_NAME} WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * Lists all attachments for a specific invoice with user access check
 * @async
 * @param {Object} req - Request object containing invoice ID
 * @param {Object} res - Response object
 */
async function listAttachmentsByInvoice(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const { invoice_id } = req.params;

    const [attachments] = await pool.execute(
      `SELECT a.* 
       FROM ${TABLE_NAME} a
       JOIN Invoice i ON a.invoice_id = i.id
       WHERE a.invoice_id = ? AND i.user_id = ?
       ORDER BY a.created_at DESC`,
      [invoice_id, req.user.id]
    );

    res.json({
      data: attachments,
    });
  } catch (error) {
    console.error('Error listing attachments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createAttachment,
  getAttachmentById,
  deleteAttachment,
  listAttachmentsByInvoice,
};
