/**
 * @file controllers/items/items.js
 * @module itemsController
 * @description Handles item-related operations including CRUD
 */

const {
  createEntity,
  updateEntity,
  listEntities,
  deleteEntity,
} = require('../utils/utils');
const pool = require('../../config/database');

const TABLE_NAME = 'Item';

const VALID_TYPES = ['product', 'service'];

/**
 * Validates item data
 * @param {Object} data - Item data to validate
 * @returns {Object} Validation result with error message if invalid
 */
function validateItemData(data) {
  const { name, description, default_price, type } = data;

  if (!name?.trim()) {
    return { error: 'Name is required' };
  }

  if (default_price === undefined || default_price === null) {
    return { error: 'Default price is required' };
  }

  if (isNaN(default_price) || default_price < 0) {
    return { error: 'Default price must be a non-negative number' };
  }

  if (!type || !VALID_TYPES.includes(type)) {
    return { error: `Type must be one of: ${VALID_TYPES.join(', ')}` };
  }

  return { isValid: true };
}

/**
 * Creates a new item
 * @async
 * @param {Object} req - Request object containing item data
 * @param {Object} res - Response object
 */
async function createItem(req, res) {
  const validation = validateItemData(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const { name, description, default_price, type, image } = req.body;

  try {
    await createEntity({
      tableName: TABLE_NAME,
      data: {
        name,
        description,
        default_price: Number(default_price),
        type,
        image: image || null,
      },
      res,
      user: req.user,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'An item with this name already exists',
      });
    }
    throw error;
  }
}

/**
 * Updates an item's details
 * @async
 * @param {Object} req - Request object containing updated item data
 * @param {Object} res - Response object
 */
async function updateItem(req, res) {
  const updateData = {};
  const { name, description, default_price, type, image, is_active } = req.body;

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (default_price !== undefined) updateData.default_price = default_price;
  if (type !== undefined) updateData.type = type;
  if (image !== undefined) updateData.image = image;
  if (is_active !== undefined) updateData.is_active = is_active;

  if (Object.keys(updateData).length > 0) {
    const validation = validateItemData({
      name: name ?? 'placeholder',
      description: description ?? 'placeholder',
      default_price: default_price ?? 0,
      type: type ?? VALID_TYPES[0],
      ...updateData,
    });

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
  }

  try {
    await updateEntity({
      tableName: TABLE_NAME,
      id: req.params.id,
      data: updateData,
      res,
      user: req.user,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'An item with this name already exists',
      });
    }
    throw error;
  }
}

/**
 * Lists all items with filtering and pagination
 * @async
 * @param {Object} req - Request object containing filter parameters
 * @param {Object} res - Response object
 */
async function listItems(req, res) {
  const {
    type,
    is_active,
    search,
    sort_by = 'created_at',
    order = 'DESC',
  } = req.query;

  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({
      error: 'Invalid type. Must be either product or service',
    });
  }

  const allowedColumns = ['created_at', 'name', 'type', 'default_price'];
  const sortByColumn = allowedColumns.includes(sort_by)
    ? sort_by
    : 'created_at';

  const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase())
    ? order.toUpperCase()
    : 'DESC';

  if (!search) {
    const filters = {};
    if (type) filters.type = type;
    if (is_active !== undefined) filters.is_active = is_active;

    await listEntities({
      tableName: TABLE_NAME,
      res,
      user: req.user,
      filters,
      orderBy: `${sortByColumn} ${sortOrder}`,
    });
    return;
  }

  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const query = `
      SELECT *
      FROM ${TABLE_NAME}
      WHERE created_by_user_id = ?
      ${type ? 'AND type = ?' : ''}
      ${is_active !== undefined ? 'AND is_active = ?' : ''}
      AND (name LIKE ? OR description LIKE ?)
      ORDER BY ${sortByColumn} ?
    `;

    const params = [req.user.id];
    if (type) params.push(type);
    if (is_active !== undefined) params.push(is_active);

    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam, sortOrder);

    const [items] = await pool.execute(query, params);
    res.json({ data: items });
  } catch (error) {
    console.error('Error listing items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Retrieves an item by ID
 * @async
 * @param {Object} req - Request object containing item ID
 * @param {Object} res - Response object
 */
async function getItemById(req, res) {
  await getEntityById({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
    user: req.user,
  });
}

/**
 * Deletes an item by ID
 * @async
 * @param {Object} req - Request object containing item ID
 * @param {Object} res - Response object
 */
async function deleteItem(req, res) {
  await deleteEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
    user: req.user,
  });
}

module.exports = {
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  listItems,
};
