/**
 * @file controllers/templates/templates.js
 * @module templateController
 * @description Handles template-related operations including CRUD
 */

const {
  createEntity,
  getEntityById,
  updateEntity,
  deleteEntity,
  listEntities,
} = require('../utils/utils');

const TABLE_NAME = 'Template';

/**
 * Creates a new template
 * @async
 * @param {Object} req - Request object containing template data
 * @param {Object} res - Response object
 */
async function createTemplate(req, res) {
  const { template_name } = req.body;
  await createEntity({
    tableName: TABLE_NAME,
    data: { template_name },
    res,
  });
}

/**
 * Retrieves a template by ID
 * @async
 * @param {Object} req - Request object containing template ID
 * @param {Object} res - Response object
 */
async function getTemplateById(req, res) {
  await getEntityById({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
  });
}

/**
 * Updates a template's details
 * @async
 * @param {Object} req - Request object containing updated template data
 * @param {Object} res - Response object
 */
async function updateTemplate(req, res) {
  const { template_name } = req.body;
  await updateEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    data: { template_name },
    res,
  });
}

/**
 * Deletes a template by ID
 * @async
 * @param {Object} req - Request object containing template ID
 * @param {Object} res - Response object
 */
async function deleteTemplate(req, res) {
  await deleteEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    res,
  });
}

/**
 * Lists all templates
 * @async
 * @param {Object} req - Request object containing filter parameters
 * @param {Object} res - Response object
 */
async function listTemplates(req, res) {
  await listEntities({
    tableName: TABLE_NAME,
    res,
  });
}

module.exports = {
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  listTemplates,
};
