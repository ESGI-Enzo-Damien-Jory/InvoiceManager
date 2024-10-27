/**
 * @file controllers/taxes/taxes.js
 * @module taxesController
 * @description Handles tax-related operations including CRUD
 */

const {
  createEntity,
  getEntityById,
  updateEntity,
  listEntities,
} = require('../utils/utils');
const pool = require('../../config/database');

const TABLE_NAME = 'Tax';

/**
 * Creates a new tax
 * @async
 * @param {Object} req - Request object containing tax data
 * @param {Object} res - Response object
 */
async function createTax(req, res) {
  const { name, type, value, apply_by_default } = req.body;

  if (!validateTypeAndValue(type, value, res)) {
    return;
  }

  await createEntity({
    tableName: TABLE_NAME,
    data: { name, type, value, apply_by_default },
    res,
    user: req.user,
  });
}

/**
 * Retrieves a tax by ID
 * @async
 * @param {Object} req - Request object containing tax ID
 * @param {Object} res - Response object
 */
async function getTaxById(req, res) {
  await getEntityById({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
    user: req.user,
  });
}

/**
 * Updates a tax's details
 * @async
 * @param {Object} req - Request object containing updated tax data
 * @param {Object} res - Response object
 */
async function updateTax(req, res) {
  const { name, type, value, apply_by_default } = req.body;

  if (type && value !== undefined && !validateTypeAndValue(type, value, res)) {
    return;
  }

  await updateEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    data: { name, type, value, apply_by_default },
    res,
    user: req.user,
  });
}

/**
 * Deletes a tax and preserves its information in associated invoices
 * @async
 * @param {Object} req - Request object containing tax ID
 * @param {Object} res - Response object
 */

async function deleteTax(req, res) {
  await deleteEntityWithTransaction({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
    user: req.user,
  });
}

/**
 * Lists all taxes
 * @async
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listTaxes(req, res) {
  await listEntities({
    tableName: TABLE_NAME,
    res,
    user: req.user,
    filters: req.query,
  });
}

module.exports = {
  createTax,
  getTaxById,
  updateTax,
  deleteTax,
  listTaxes,
};
