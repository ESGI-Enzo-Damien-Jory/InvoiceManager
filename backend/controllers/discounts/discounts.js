/**
 * @file controllers/discounts/discounts.js
 * @module discountsController
 * @description Handles discount-related operations including CRUD
 */

const {
  createEntity,
  getEntityById,
  updateEntity,
  listEntities,
} = require('../utils/utils');
const pool = require('../../config/database');

const TABLE_NAME = 'Discount';

/**
 * Creates a new discount
 * @async
 * @param {Object} req - Request object containing discount data
 * @param {Object} res - Response object
 */
async function createDiscount(req, res) {
  const { name, type, value, is_active } = req.body;

  if (!validateTypeAndValue(type, value, res)) {
    return;
  }

  await createEntity({
    tableName: TABLE_NAME,
    data: { name, type, value, is_active },
    res,
    user: req.user,
  });
}

/**
 * Retrieves a discount by ID
 * @async
 * @param {Object} req - Request object containing discount ID
 * @param {Object} res - Response object
 */
async function getDiscountById(req, res) {
  await getEntityById({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
    user: req.user,
  });
}

/**
 * Updates a discount's details
 * @async
 * @param {Object} req - Request object containing updated discount data
 * @param {Object} res - Response object
 */
async function updateDiscount(req, res) {
  const { name, type, value, is_active } = req.body;

  if (type && value !== undefined && !validateTypeAndValue(type, value, res)) {
    return;
  }

  await updateEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    data: { name, type, value, is_active },
    res,
    user: req.user,
  });
}

/**
 * Deletes a discount and preserves its information in associated invoices
 * @async
 * @param {Object} req - Request object containing discount ID
 * @param {Object} res - Response object
 */
async function deleteDiscount(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute('SET @current_user_id = ?', [req.user.id]);

    const [result] = await connection.execute(
      'DELETE FROM Discount WHERE id = ? AND created_by_user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Discount not found' });
    }

    await connection.commit();
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting discount:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * Lists all discounts
 * @async
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listDiscounts(req, res) {
  await listEntities({
    tableName: TABLE_NAME,
    res,
    user: req.user,
    filters: req.query,
  });
}

module.exports = {
  createDiscount,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  listDiscounts,
};
