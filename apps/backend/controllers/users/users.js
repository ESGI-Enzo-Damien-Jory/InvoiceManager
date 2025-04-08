/**
 * @file controllers/users.js
 * @module userController
 * @description Handles user-related operations including CRUD, integrating with Clerk.
 */

const {
  getEntityById,
  updateEntity,
  deleteEntity,
  listEntities,
} = require('../utils/utils');
const pool = require('../../config/database');

const TABLE_NAME = 'User';

/**
 * Synchronizes a user from Clerk into the local database
 * @async
 * @param {Object} req - Request object containing user data from Clerk
 * @param {Object} res - Response object
 */
async function syncUser(req, res) {
  try {
    const { clerk_user_id, email, first_name, last_name, username } = req.body;

    if (!clerk_user_id) {
      return res.status(400).json({ error: 'Clerk user ID is required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [existingUser] = await connection.execute(
        'SELECT id FROM User WHERE clerk_user_id = ?',
        [clerk_user_id]
      );

      let result;
      if (existingUser.length === 0) {
        [result] = await connection.execute(
          `INSERT INTO User (
            clerk_user_id, 
            email, 
            first_name, 
            last_name, 
            username, 
            last_login
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [clerk_user_id, email, first_name, last_name, username]
        );

        await connection.commit();
        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertId,
          isNewUser: true,
        });
      } else {
        await connection.execute(
          `UPDATE User 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE clerk_user_id = ?`,
          [clerk_user_id]
        );

        await connection.commit();
        res.status(200).json({
          message: 'User login time updated',
          userId: existingUser[0].id,
          isNewUser: false,
        });
      }
    } catch (error) {
      await connection.rollback();

      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('unique_user_email')) {
          return res.status(409).json({
            error: 'Email already in use',
            code: 'EMAIL_DUPLICATE',
          });
        }
        if (error.message.includes('unique_username')) {
          return res.status(409).json({
            error: 'Username already in use',
            code: 'USERNAME_DUPLICATE',
          });
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error synchronizing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Retrieves a user by ID
 * @async
 * @param {Object} req - Request object containing user ID
 * @param {Object} res - Response object
 */
async function getUserById(req, res) {
  if (!req.params.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  await getEntityById({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
  });
}

/**
 * Updates a user's details
 * @async
 * @param {Object} req - Request object containing updated user data
 * @param {Object} res - Response object
 */
async function updateUser(req, res) {
  const { email, first_name, last_name, username, role, is_active } = req.body;
  await updateEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    data: { email, first_name, last_name, username, role, is_active },
    res,
  });
}

/**
 * Deletes a user by ID
 * @async
 * @param {Object} req - Request object containing user ID
 * @param {Object} res - Response object
 */
async function deleteUser(req, res) {
  if (!req.params.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  await deleteEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
  });
}

/**
 * Lists all users with optional filtering by role or activity status
 * @async
 * @param {Object} req - Request object containing filter parameters
 * @param {Object} res - Response object
 */
async function listUsers(req, res) {
  const { role, is_active } = req.query;
  await listEntities({
    tableName: TABLE_NAME,
    filters: { role, is_active },
    orderBy: 'created_at DESC',
    res,
  });
}

module.exports = {
  syncUser,
  getUserById,
  updateUser,
  deleteUser,
  listUsers,
};
