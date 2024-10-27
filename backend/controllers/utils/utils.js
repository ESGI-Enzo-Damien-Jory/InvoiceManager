/**
 * @file controllers/utils/utils.js
 * @module controllerUtils
 * @description Utility functions for controller operations with user access control
 */

const pool = require('../../config/database');

const allowedTables = {
  User: [
    'id',
    'clerk_user_id',
    'first_name',
    'last_name',
    'username',
    'email',
    'role',
    'is_active',
    'last_login',
    'created_at',
    'updated_at',
  ],
  Client: [
    'id',
    'created_by_user_id',
    'email',
    'phone',
    'type',
    'address',
    'image',
    'is_active',
    'created_at',
    'updated_at',
  ],
  Client_Individual: ['client_id', 'last_name', 'first_name'],
  Client_Company: ['client_id', 'company_name', 'contact_name'],
  Template: ['id', 'template_name', 'created_at', 'updated_at'],
  Invoice: [
    'id',
    'invoice_number',
    'client_id',
    'created_by_user_id',
    'template_id',
    'creation_date',
    'expiration_date',
    'state',
    'total_amount',
    'currency',
    'notes',
    'invoice_subject',
    'subtotal',
    'created_at',
    'updated_at',
  ],
  Item: [
    'id',
    'created_by_user_id',
    'name',
    'description',
    'default_price',
    'type',
    'image',
    'is_active',
    'created_at',
    'updated_at',
  ],
  Invoice_Line: [
    'id',
    'invoice_id',
    'item_id',
    'quantity',
    'price',
    'description',
    'created_at',
  ],
  Tax: [
    'id',
    'created_by_user_id',
    'name',
    'type',
    'value',
    'apply_by_default',
    'created_at',
    'updated_at',
  ],
  Discount: [
    'id',
    'created_by_user_id',
    'name',
    'type',
    'value',
    'is_active',
    'created_at',
    'updated_at',
  ],
  Invoice_Tax: ['invoice_id', 'tax_id'],
  Invoice_Discount: ['invoice_id', 'discount_id'],
  Invoice_History: [
    'id',
    'invoice_id',
    'previous_state',
    'new_state',
    'state_change_timestamp',
    'changed_by_user_id',
  ],
  Invoice_Log: [
    'id',
    'invoice_id',
    'modification_type',
    'tax_id',
    'tax_name',
    'tax_type',
    'tax_value',
    'discount_id',
    'discount_name',
    'discount_type',
    'discount_value',
    'line_item_id',
    'item_id',
    'previous_quantity',
    'new_quantity',
    'previous_price',
    'new_price',
    'item_description',
    'previous_state',
    'new_state',
    'previous_subtotal',
    'new_subtotal',
    'previous_total',
    'new_total',
    'previous_subject',
    'new_subject',
    'previous_notes',
    'new_notes',
    'previous_expiration_date',
    'new_expiration_date',
    'modification_timestamp',
    'changed_by_user_id',
    'details',
  ],
  Attachment: [
    'id',
    'invoice_id',
    'file_name',
    'file_data',
    'extension',
    'created_at',
  ],
};

/**
 * Executes a CREATE operation for any entity with user association
 * @async
 * @param {Object} params - Parameters for the create operation
 * @param {string} params.tableName - Name of the table to insert into
 * @param {Object} params.data - Key-value pairs of data to insert
 * @param {Object} params.res - Response object
 * @param {Object} params.user - User object from request
 * @param {string} [params.userIdField='created_by_user_id'] - Name of the user ID field in the table
 * @returns {Promise<void>}
 */
async function createEntity({
  tableName,
  data,
  res,
  user,
  userIdField = 'created_by_user_id',
}) {
  if (!user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const dataWithUser = {
      ...data,
      [userIdField]: user.id,
    };

    const columns = Object.keys(dataWithUser).join(', ');
    const placeholders = Object.keys(dataWithUser)
      .map(() => '?')
      .join(', ');
    const values = Object.values(dataWithUser);

    const [result] = await pool.execute(
      `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      id: result.insertId,
      message: `${tableName} created successfully`,
    });
  } catch (error) {
    console.error(`Error creating ${tableName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Retrieves an entity by ID with user access check
 * @async
 * @param {Object} params - Parameters for the get operation
 * @param {string} params.tableName - Name of the table to query
 * @param {number|string} params.id - ID of the entity to retrieve
 * @param {Object} params.res - Response object
 * @param {Object} params.user - User object from request
 * @param {string} [params.userIdField='created_by_user_id'] - Name of the user ID field in the table
 * @param {string[]} [params.selectFields] - Specific fields to select, defaults to all
 * @returns {Promise<void>}
 */
async function getEntityById({
  tableName,
  id,
  res,
  user,
  userIdField = 'created_by_user_id',
  selectFields = ['*'],
}) {
  if (!user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT ${selectFields.join(', ')} FROM ${tableName} 
       WHERE id = ? AND ${userIdField} = ?`,
      [id, user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `${tableName} not found` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(`Error retrieving ${tableName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Updates an entity's details with user access check
 * @async
 * @param {Object} params - Parameters for the update operation
 * @param {string} params.tableName - Name of the table to update
 * @param {number|string} params.id - ID of the entity to update
 * @param {Object} params.data - Key-value pairs of data to update
 * @param {Object} params.res - Response object
 * @param {Object} params.user - User object from request
 * @param {string} [params.userIdField='created_by_user_id'] - Name of the user ID field in the table
 * @returns {Promise<void>}
 */
async function updateEntity({
  tableName,
  id,
  data,
  res,
  user,
  userIdField = 'created_by_user_id',
}) {
  if (!user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [checkRow] = await connection.execute(
      `SELECT id FROM ${tableName} WHERE id = ? AND ${userIdField} = ?`,
      [id, user.id]
    );

    if (checkRow.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `${tableName} not found` });
    }

    let updateQuery = `UPDATE ${tableName} SET `;
    const updateParams = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateQuery += `${key} = ?, `;
        updateParams.push(value);
      }
    });

    if (updateParams.length > 0) {
      updateQuery = updateQuery.slice(0, -2);
      updateQuery += ` WHERE id = ? AND ${userIdField} = ?`;
      updateParams.push(id, user.id);

      const [result] = await connection.execute(updateQuery, updateParams);

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `${tableName} not found` });
      }
    }

    await connection.commit();
    res.json({ message: `${tableName} updated successfully` });
  } catch (error) {
    await connection.rollback();
    console.error(`Error updating ${tableName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * Deletes an entity by ID with user access check
 * @async
 * @param {Object} params - Parameters for the delete operation
 * @param {string} params.tableName - Name of the table to delete from
 * @param {number|string} params.id - ID of the entity to delete
 * @param {Object} params.res - Response object
 * @param {Object} params.user - User object from request
 * @param {string} [params.userIdField='created_by_user_id'] - Name of the user ID field in the table
 * @returns {Promise<void>}
 */
async function deleteEntity({
  tableName,
  id,
  res,
  user,
  userIdField = 'created_by_user_id',
}) {
  if (!user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const [result] = await pool.execute(
      `DELETE FROM ${tableName} WHERE id = ? AND ${userIdField} = ?`,
      [id, user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `${tableName} not found` });
    }

    res.json({ message: `${tableName} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting ${tableName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Lists entities with optional filtering and user access check
 * @async
 * @param {Object} params - Parameters for the list operation
 * @param {string} params.tableName - Name of the table to query
 * @param {Object} params.res - Response object
 * @param {Object} params.user - User object from request
 * @param {Object} [params.filters={}] - Key-value pairs for WHERE conditions
 * @param {string} [params.orderBy='created_at DESC'] - ORDER BY clause
 * @param {string} [params.userIdField='created_by_user_id'] - Name of the user ID field in the table
 * @param {string[]} [params.selectFields] - Specific fields to select, defaults to all
 * @returns {Promise<void>}
 */
async function listEntities({
  tableName,
  res,
  user,
  filters = {},
  orderBy = 'created_at DESC',
  userIdField = 'created_by_user_id',
  selectFields = ['*'],
}) {
  if (!user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  if (!allowedTables.hasOwnProperty(tableName)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const allowedColumns = allowedTables[tableName];
  if (selectFields.includes('*')) {
    selectFields = allowedColumns;
  } else {
    const invalidFields = selectFields.filter(
      (field) => !allowedColumns.includes(field)
    );
    if (invalidFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Invalid select fields: ${invalidFields.join(', ')}` });
    }
  }

  const orderByParts = orderBy.split(' ');
  const orderByField = orderByParts[0];
  const orderByDirection = orderByParts[1]?.toUpperCase() || 'ASC';
  if (
    !allowedColumns.includes(orderByField) ||
    !['ASC', 'DESC'].includes(orderByDirection)
  ) {
    return res.status(400).json({ error: 'Invalid order by clause' });
  }

  try {
    let query = `SELECT ${selectFields.join(', ')} FROM \`${tableName}\` WHERE \`${userIdField}\` = ?`;
    const params = [user.id];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && allowedColumns.includes(key)) {
        query += ` AND \`${key}\` = ?`;
        params.push(value);
      }
    });

    query += ` ORDER BY \`${orderByField}\` ${orderByDirection}`;

    const [rows] = await pool.execute(query, params);

    res.json({
      data: rows,
    });
  } catch (error) {
    console.error(`Error listing ${tableName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Validates the type and value of percentage or fixed amount
 * @param {string} type - The type of the value (percentage or fixed)
 * @param {number} value - The value to validate
 * @param {Object} res - Response object to handle errors
 * @returns {boolean} - Returns true if valid, false if an error response is sent
 */
function validateTypeAndValue(type, value, res) {
  if (type === 'percentage' && (value < 0 || value > 100)) {
    res.status(400).json({ error: 'Percentage must be between 0 and 100' });
    return false;
  }
  if (type === 'fixed' && value < 0) {
    res.status(400).json({ error: 'Fixed value cannot be negative' });
    return false;
  }
  if (!['percentage', 'fixed'].includes(type)) {
    res.status(400).json({ error: 'Type must be either percentage or fixed' });
    return false;
  }
  return true;
}

/**
 * Deletes an entity by ID with user access check and transaction management
 * @async
 * @param {Object} params - Parameters for the delete operation
 * @param {string} params.tableName - Name of the table to delete from
 * @param {number|string} params.id - ID of the entity to delete
 * @param {Object} params.res - Response object
 * @param {Object} params.user - User object from request
 * @param {string} [params.userIdField='created_by_user_id'] - Name of the user ID field in the table
 * @returns {Promise<void>}
 */
async function deleteEntityWithTransaction({
  tableName,
  id,
  res,
  user,
  userIdField = 'created_by_user_id',
}) {
  if (!user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('SET @current_user_id = ?', [user.id]);

    const [result] = await connection.execute(
      `DELETE FROM ${tableName} WHERE id = ? AND ${userIdField} = ?`,
      [id, user.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `${tableName} not found` });
    }

    await connection.commit();
    res.json({ message: `${tableName} deleted successfully` });
  } catch (error) {
    await connection.rollback();
    console.error(`Error deleting ${tableName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

module.exports = {
  createEntity,
  getEntityById,
  updateEntity,
  deleteEntity,
  listEntities,
  validateTypeAndValue,
  deleteEntityWithTransaction,
};
