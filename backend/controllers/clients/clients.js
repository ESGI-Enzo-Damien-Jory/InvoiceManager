/**
 * @file controllers/clients.js
 * @module clientController
 * @description Handles client-related operations including CRUD
 */

const pool = require('../../config/database');

const TABLE_NAME = 'Client';

/**
 * Creates a new client with user association
 * @async
 * @param {Object} req - Request object containing client data
 * @param {Object} res - Response object
 */
async function createClient(req, res) {
  try {
    const {
      email,
      phone,
      type,
      address,
      image,
      first_name,
      last_name,
      company_name,
      contact_name,
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [clientResult] = await connection.execute(
        `INSERT INTO Client (email, phone, type, address, image, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email, phone, type, address, image, req.user.id]
      );

      const client_id = clientResult.insertId;

      if (type === 'individual') {
        await connection.execute(
          `INSERT INTO Client_Individual (client_id, first_name, last_name)
           VALUES (?, ?, ?)`,
          [client_id, first_name, last_name]
        );
      } else if (type === 'company') {
        await connection.execute(
          `INSERT INTO Client_Company (client_id, company_name, contact_name)
           VALUES (?, ?, ?)`,
          [client_id, company_name, contact_name]
        );
      } else {
        throw new Error('Invalid client type');
      }

      await connection.commit();
      res.status(201).json({
        id: client_id,
        message: 'Client created successfully',
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Retrieves a client by ID with user access check
 * @async
 * @param {Object} req - Request object containing client ID
 * @param {Object} res - Response object
 */
async function getClientById(req, res) {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    const [clients] = await pool.execute(
      `SELECT 
        c.*,
        CASE 
          WHEN c.type = 'individual' THEN JSON_OBJECT(
            'first_name', ci.first_name,
            'last_name', ci.last_name
          )
          WHEN c.type = 'company' THEN JSON_OBJECT(
            'company_name', cc.company_name,
            'contact_name', cc.contact_name
          )
          ELSE NULL
        END as details
      FROM Client c
      LEFT JOIN Client_Individual ci ON c.id = ci.client_id
      LEFT JOIN Client_Company cc ON c.id = cc.client_id
      WHERE c.id = ? AND c.created_by_user_id = ?`,
      [id, req.user.id]
    );

    if (clients.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(clients[0]);
  } catch (error) {
    console.error('Error retrieving client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Builds a parameterized UPDATE query for the specified table
 * @param {string} table - Name of the table to update
 * @param {Object} data - Object containing field-value pairs to update
 * @param {string|number} id - ID of the record to update
 * @param {number} userId - ID of the authenticated user
 * @returns {Object} Object containing the query string and parameters array
 */
function buildUpdateQuery(table, data, id, userId) {
  let updateQuery = `UPDATE ${table} SET `;
  const updateParams = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateQuery += `${key} = ?, `;
      updateParams.push(value);
    }
  });

  if (updateParams.length > 0) {
    updateQuery = updateQuery.slice(0, -2);
    if (table === 'Client') {
      updateQuery += ' WHERE id = ? AND created_by_user_id = ?';
      updateParams.push(id, userId);
    } else {
      updateQuery += ' WHERE client_id = ?';
      updateParams.push(id);
    }
  }

  return { updateQuery, updateParams };
}
/**
 * Updates a client with user access check
 * @async
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateClient(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      email,
      phone,
      address,
      image,
      is_active,
      first_name,
      last_name,
      company_name,
      contact_name,
    } = req.body;

    await connection.beginTransaction();

    const [clientCheck] = await connection.execute(
      'SELECT type FROM Client WHERE id = ? AND created_by_user_id = ?',
      [id, req.user.id]
    );

    if (clientCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Client not found' });
    }

    const clientType = clientCheck[0].type;

    const mainClientData = { email, phone, address, image, is_active };
    const { updateQuery, updateParams } = buildUpdateQuery(
      'Client',
      mainClientData,
      id,
      req.user.id
    );

    if (updateParams.length > 0) {
      const [result] = await connection.execute(updateQuery, updateParams);
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Failed to update client' });
      }
    }

    if (
      clientType === 'individual' &&
      (first_name !== undefined || last_name !== undefined)
    ) {
      const individualData = { first_name, last_name };
      const { updateQuery: individualQuery, updateParams: individualParams } =
        buildUpdateQuery('Client_Individual', individualData, id);

      if (individualParams.length > 0) {
        await connection.execute(individualQuery, individualParams);
      }
    } else if (
      clientType === 'company' &&
      (company_name !== undefined || contact_name !== undefined)
    ) {
      const companyData = { company_name, contact_name };
      const { updateQuery: companyQuery, updateParams: companyParams } =
        buildUpdateQuery('Client_Company', companyData, id);

      if (companyParams.length > 0) {
        await connection.execute(companyQuery, companyParams);
      }
    }

    await connection.commit();
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}
/**
 * Deletes a client by ID with user access check
 * @async
 * @param {Object} req - Request object containing client ID
 * @param {Object} res - Response object
 */
async function deleteClient(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  if (!req.params.id) {
    return res.status(400).json({ error: 'Client ID is required' });
  }

  const connection = await pool.getConnection();
  try {
    const [clientCheck] = await connection.execute(
      'SELECT id FROM Client WHERE id = ? AND created_by_user_id = ?',
      [req.params.id, req.user.id]
    );

    if (clientCheck.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await connection.execute(
      'DELETE FROM Client WHERE id = ? AND created_by_user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * Lists all clients with filtering and pagination for a specific user
 * @async
 * @param {Object} req - Request object containing filter parameters
 * @param {Object} res - Response object
 */
async function listClients(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { type, is_active, search } = req.query;

    let baseQuery = `
      SELECT 
        c.*,
        CASE 
          WHEN c.type = 'individual' THEN CONCAT(ci.first_name, ' ', ci.last_name)
          WHEN c.type = 'company' THEN CONCAT(cc.company_name, 
            CASE 
              WHEN cc.contact_name IS NOT NULL THEN CONCAT(' (Contact: ', cc.contact_name, ')')
              ELSE ''
            END)
          ELSE NULL
        END as client_name,
        CASE 
          WHEN c.type = 'individual' THEN JSON_OBJECT(
            'first_name', ci.first_name,
            'last_name', ci.last_name
          )
          WHEN c.type = 'company' THEN JSON_OBJECT(
            'company_name', cc.company_name,
            'contact_name', cc.contact_name
          )
          ELSE NULL
        END as details
      FROM Client c
      LEFT JOIN Client_Individual ci ON c.id = ci.client_id
      LEFT JOIN Client_Company cc ON c.id = cc.client_id
      WHERE c.created_by_user_id = ?
    `;
    const params = [req.user.id];

    if (type) {
      baseQuery += ' AND c.type = ?';
      params.push(type);
    }

    if (is_active !== undefined) {
      baseQuery += ' AND c.is_active = ?';
      params.push(is_active);
    }

    if (search) {
      baseQuery += ` AND (
        c.email LIKE ? OR 
        c.phone LIKE ? OR
        c.address LIKE ? OR
        ci.first_name LIKE ? OR
        ci.last_name LIKE ? OR
        cc.company_name LIKE ? OR
        cc.contact_name LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam
      );
    }

    baseQuery += ' ORDER BY c.created_at DESC';

    const [clients] = await pool.execute(baseQuery, params);

    res.json({
      data: clients,
    });
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createClient,
  getClientById,
  updateClient,
  deleteClient,
  listClients,
};
