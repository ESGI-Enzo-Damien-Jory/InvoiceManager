/**
 * @file controllers/invoices.js
 * @module invoiceController
 * @description Handles invoice-related operations including CRUD and state management
 */

const { getEntityById, updateEntity } = require('../utils/utils');
const pool = require('../../config/database');

const TABLE_NAME = 'Invoice';

const MAX_LINE_ITEMS = 100;
const MAX_TOTAL_AMOUNT = 1000000;
const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'INR',
];

/**
 * Creates a new invoice
 * @async
 * @param {Object} req - Request object containing invoice data
 * @param {Object} res - Response object
 */
async function createInvoice(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      client_id,
      template_id,
      expiration_date,
      currency,
      notes,
      invoice_subject,
      line_items,
    } = req.body;

    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      await connection.rollback();
      return res.status(400).json({
        error: `Unsupported currency. Please use one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
      });
    }

    if (!Array.isArray(line_items) || line_items.length === 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: 'At least one line item is required' });
    }

    if (line_items.length > MAX_LINE_ITEMS) {
      await connection.rollback();
      return res.status(400).json({
        error: `Maximum ${MAX_LINE_ITEMS} line items allowed per invoice`,
      });
    }

    const missingItemId = line_items.some((item) => !item.item_id);
    if (missingItemId) {
      await connection.rollback();
      return res.status(400).json({
        error:
          'All line items must reference an existing item (item_id is required)',
      });
    }

    const [clientCheck] = await connection.execute(
      'SELECT id FROM Client WHERE id = ? AND created_by_user_id = ? AND is_active = TRUE',
      [client_id, req.user.id]
    );

    if (clientCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Client not found or inactive' });
    }

    const [lastInvoice] = await connection.execute(
      'SELECT MAX(CAST(SUBSTRING(invoice_number, 4) AS UNSIGNED)) as last_num FROM Invoice WHERE invoice_number LIKE ?',
      [`INV${new Date().getFullYear()}%`]
    );

    const nextNum = (lastInvoice[0].last_num || 0) + 1;
    const invoice_number = `INV${new Date().getFullYear()}${nextNum.toString().padStart(4, '0')}`;

    const [result] = await connection.execute(
      `INSERT INTO Invoice (
        invoice_number, client_id, created_by_user_id, template_id,
        expiration_date, currency, notes, invoice_subject
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number,
        client_id,
        req.user.id,
        template_id,
        expiration_date,
        currency,
        notes,
        invoice_subject,
      ]
    );

    const invoiceId = result.insertId;

    const itemIds = [...new Set(line_items.map((item) => item.item_id))];

    const query = `SELECT id, name, default_price, description, is_active 
    FROM Item 
    WHERE id IN (${itemIds.map(() => '?').join(',')}) 
    AND created_by_user_id = ?`;
    const values = [...itemIds, req.user.id];
    const [items] = await connection.execute(query, values);

    const itemsMap = new Map(items.map((item) => [item.id, item]));

    const missingItems = itemIds.filter((id) => !itemsMap.has(id));
    if (missingItems.length > 0) {
      await connection.rollback();
      return res.status(404).json({
        error: `Items with ids ${missingItems.join(', ')} not found or do not belong to user`,
      });
    }

    const inactiveItems = items
      .filter((item) => !item.is_active)
      .map((item) => item.name);
    if (inactiveItems.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: `The following items are inactive and cannot be used: ${inactiveItems.join(', ')}`,
      });
    }

    const combinedItems = new Map();
    for (const item of line_items) {
      const key = `item_${item.item_id}`;

      if (combinedItems.has(key)) {
        const existing = combinedItems.get(key);
        existing.quantity += item.quantity;
      } else {
        combinedItems.set(key, { ...item });
      }
    }

    let preliminaryTotal = 0;
    for (const item of combinedItems.values()) {
      const { item_id, quantity, price: providedPrice } = item;
      const itemDetails = itemsMap.get(item_id);

      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Quantity must be a positive integer',
        });
      }

      const finalPrice = providedPrice || itemDetails.default_price;
      if (finalPrice < 0) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Price must be non-negative',
        });
      }

      preliminaryTotal += quantity * finalPrice;
      if (preliminaryTotal > MAX_TOTAL_AMOUNT) {
        await connection.rollback();
        return res.status(400).json({
          error: `Invoice total amount exceeds maximum limit of ${MAX_TOTAL_AMOUNT}`,
        });
      }

      await connection.execute(
        `INSERT INTO Invoice_Line (
          invoice_id, item_id, quantity, price, description
        ) VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, item_id, quantity, finalPrice, itemDetails.description]
      );
    }

    await connection.commit();
    res.status(201).json({
      id: invoiceId,
      invoice_number,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

/**
 * Retrieves an invoice by ID with all related information
 * @async
 * @param {Object} req - Request object containing invoice ID
 * @param {Object} res - Response object
 */
async function getInvoiceById(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const { id } = req.params;

    const [invoices] = await pool.execute(
      `SELECT 
        i.*,
        JSON_OBJECT(
          'id', c.id,
          'email', c.email,
          'phone', c.phone,
          'type', c.type,
          'address', c.address,
          'details', CASE 
            WHEN c.type = 'individual' THEN 
              JSON_OBJECT('first_name', ci.first_name, 'last_name', ci.last_name)
            ELSE 
              JSON_OBJECT('company_name', cc.company_name)
          END
        ) as client,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', il.id,
              'item_id', il.item_id,
              'quantity', il.quantity,
              'price', il.price,
              'description', il.description,
              'item_details', JSON_OBJECT(
                'name', itm.name,
                'description', itm.description,
                'type', itm.type
              )
            )
          ) 
          FROM Invoice_Line il 
          LEFT JOIN Item itm ON il.item_id = itm.id 
          WHERE il.invoice_id = i.id),
        '[]'
        ) as line_items,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', t.id,
              'name', t.name,
              'type', t.type,
              'value', t.value
            )
          ) 
          FROM Tax t 
          JOIN Invoice_Tax it ON t.id = it.tax_id 
          WHERE it.invoice_id = i.id),
        '[]'
        ) as taxes,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', d.id,
              'name', d.name,
              'type', d.type,
              'value', d.value
            )
          ) 
          FROM Discount d 
          JOIN Invoice_Discount id_disc ON d.id = id_disc.discount_id 
          WHERE id_disc.invoice_id = i.id),
        '[]'
        ) as discounts
      FROM Invoice i
      JOIN Client c ON i.client_id = c.id
      LEFT JOIN Client_Individual ci ON c.id = ci.client_id AND c.type = 'individual'
      LEFT JOIN Client_Company cc ON c.id = cc.client_id AND c.type = 'company'
      WHERE i.id = ? AND i.created_by_user_id = ?`,
      [id, req.user.id]
    );

    if (!invoices[0]) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    const result = {
      ...invoice,
      client:
        typeof invoice.client === 'string'
          ? JSON.parse(invoice.client)
          : invoice.client,
      line_items:
        typeof invoice.line_items === 'string'
          ? JSON.parse(invoice.line_items)
          : [],
      taxes: typeof invoice.taxes === 'string' ? JSON.parse(invoice.taxes) : [],
      discounts:
        typeof invoice.discounts === 'string'
          ? JSON.parse(invoice.discounts)
          : [],
    };

    res.json(result);
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Updates an invoice's details
 * @async
 * @param {Object} req - Request object containing updated invoice data
 * @param {Object} res - Response object
 */
async function updateInvoice(req, res) {
  await updateEntity({
    tableName: TABLE_NAME,
    id: req.params.id,
    data: req.body,
    res,
    user: req.user,
    userIdField: 'created_by_user_id',
  });
}

/**
 * Updates an invoice's state
 * @async
 * @param {Object} req - Request object containing new state
 * @param {Object} res - Response object
 */
async function updateInvoiceState(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const { id } = req.params;
    const { state } = req.body;

    const [result] = await pool.execute(
      'UPDATE Invoice SET state = ? WHERE id = ? AND created_by_user_id = ?',
      [state, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await pool.execute('SET @current_user_id = ?', [req.user.id]);
    res.json({ message: 'Invoice state updated successfully' });
  } catch (error) {
    console.error('Error updating invoice state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Lists all invoices with filtering and pagination
 * @async
 * @param {Object} req - Request object containing filter parameters
 * @param {Object} res - Response object
 */
async function listInvoices(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  try {
    const { state, client_id, from_date, to_date, search } = req.query;

    let baseQuery = `
      SELECT 
        i.*,
        COALESCE(CONCAT(ci.first_name, ' ', ci.last_name), cc.company_name, '') AS client_name
      FROM Invoice i
      LEFT JOIN Client c ON i.client_id = c.id
      LEFT JOIN Client_Individual ci ON c.id = ci.client_id
      LEFT JOIN Client_Company cc ON c.id = cc.client_id
      WHERE i.created_by_user_id = ?
    `;
    const params = [req.user.id];

    if (state) {
      baseQuery += ' AND i.state = ?';
      params.push(state);
    }

    if (client_id) {
      baseQuery += ' AND i.client_id = ?';
      params.push(client_id);
    }

    if (from_date) {
      baseQuery += ' AND i.creation_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      baseQuery += ' AND i.creation_date <= ?';
      params.push(to_date);
    }

    if (search) {
      baseQuery += ` AND (
        i.invoice_number LIKE ? OR 
        CONCAT(COALESCE(ci.first_name, ''), ' ', COALESCE(ci.last_name, '')) LIKE ? OR
        cc.company_name LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    baseQuery += ' ORDER BY i.creation_date DESC';

    const [invoices] = await pool.execute(baseQuery, params);

    res.json({
      data: invoices,
    });
  } catch (error) {
    console.error('Error listing invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  updateInvoiceState,
  listInvoices,
};
