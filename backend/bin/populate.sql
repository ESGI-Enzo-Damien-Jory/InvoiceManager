USE Invoice_Manager;
SET FOREIGN_KEY_CHECKS = 0;

-- Insert Users
INSERT INTO `User` (clerk_user_id, first_name, last_name, username, email, role) VALUES
('user_2aX9NB1', 'John', 'Admin', 'jadmin', 'john.admin@example.com', 'admin'),
('user_7bY3MC2', 'Sarah', 'Manager', 'smanager', 'sarah.manager@example.com', 'manager'),
('user_4cZ8LD3', 'Mike', 'Handler', 'mhandler', 'mike.handler@example.com', 'manager'),
('user_5dW9KE4', 'Lisa', 'Controller', 'lcontrol', 'lisa.control@example.com', 'manager'),
('user_6eV2JF5', 'David', 'Supervisor', 'dsuper', 'david.super@example.com', 'manager');

-- Insert Clients
INSERT INTO `Client` (created_by_user_id, email, phone, type, address, is_active) VALUES
-- John's clients (User 1)
(1, 'acme.corp@example.com', '555-0100', 'company', '123 Business Ave, Suite 100', true),
(1, 'john.doe@example.com', '555-0101', 'individual', '456 Residential St', true),
(1, 'mega.industries@example.com', '555-0104', 'company', '789 Corporate Blvd', true),
(1, 'alice.worker@example.com', '555-0105', 'individual', '321 Worker Lane', false),
-- Sarah's clients (User 2)
(2, 'tech.solutions@example.com', '555-0102', 'company', '789 Innovation Park', true),
(2, 'jane.smith@example.com', '555-0103', 'individual', '321 Home Lane', true),
(2, 'startup.co@example.com', '555-0106', 'company', '456 Startup Way', true),
(2, 'bob.client@example.com', '555-0107', 'individual', '654 Client Road', true),
-- Mike's clients (User 3)
(3, 'global.corp@example.com', '555-0108', 'company', '999 Global Square', true),
(3, 'charlie.brown@example.com', '555-0109', 'individual', '789 Peanuts Ave', true),
(3, 'local.business@example.com', '555-0110', 'company', '333 Local Street', false),
(3, 'diana.prince@example.com', '555-0111', 'individual', '444 Hero Lane', true);

-- Insert Client Companies
INSERT INTO `Client_Company` (client_id, company_name, contact_name) VALUES
(1, 'Acme Corporation', 'Robert Smith'),
(3, 'Mega Industries Ltd', NULL),
(5, 'Tech Solutions Inc.', 'Michael Chang'),
(7, 'Startup Co', 'Emma Johnson'),
(9, 'Global Corp', 'James Anderson'),
(11, 'Local Business LLC', NULL);

-- Insert Client Individuals
INSERT INTO `Client_Individual` (client_id, first_name, last_name) VALUES
(2, 'John', 'Doe'),
(4, 'Alice', 'Worker'),
(6, 'Jane', 'Smith'),
(8, 'Bob', 'Client'),
(10, 'Charlie', 'Brown'),
(12, 'Diana', 'Prince');

-- Insert Templates
INSERT INTO `Template` (template_name) VALUES
('Standard Invoice'),
('Professional Services'),
('Detailed Receipt'),
('Simple Invoice'),
('Consultant Template'),
('Product Sales'),
('Service Agreement');

-- Insert Items with user ownership
INSERT INTO `Item` (created_by_user_id, name, description, default_price, type, is_active) VALUES
-- John's items
(1, 'Web Development', 'Professional web development services', 150.00, 'service', true),
(1, 'Consultation', 'Expert consultation session', 200.00, 'service', true),
(1, 'Mobile App Dev', 'Mobile application development', 175.00, 'service', true),
(1, 'SEO Package', 'Search engine optimization service', 500.00, 'service', true),
(1, 'Domain Name', 'Annual domain registration', 15.99, 'product', true),
(1, 'SSL Certificate', 'Annual SSL certificate', 75.00, 'product', false),
-- Sarah's items
(2, 'Server Hardware', 'High-performance server', 1999.99, 'product', true),
(2, 'Software License', 'Annual software license', 499.99, 'product', true),
(2, 'Cloud Storage', 'Annual cloud storage subscription', 299.99, 'service', true),
(2, 'Tech Support', '24/7 technical support', 150.00, 'service', true),
(2, 'Web Development', 'Custom web development', 160.00, 'service', true),
(2, 'Hardware Maintenance', 'Monthly hardware maintenance', 250.00, 'service', false),
-- Mike's items
(3, 'Data Analysis', 'Professional data analysis service', 225.00, 'service', true),
(3, 'Database Setup', 'Database installation and configuration', 350.00, 'service', true),
(3, 'Network Config', 'Network configuration service', 275.00, 'service', true),
(3, 'Security Audit', 'Comprehensive security audit', 750.00, 'service', true);

-- Insert Taxes with user ownership
INSERT INTO `Tax` (created_by_user_id, name, type, value, apply_by_default) VALUES
-- John's taxes
(1, 'Standard VAT', 'percentage', 20.00, true),
(1, 'Reduced Rate', 'percentage', 10.00, false),
(1, 'Fixed Service Tax', 'fixed', 25.00, false),
(1, 'Handling Fee', 'fixed', 15.00, false),
-- Sarah's taxes
(2, 'Standard VAT', 'percentage', 20.00, true),
(2, 'Zero Rate', 'percentage', 0.00, false),
(2, 'Processing Fee', 'fixed', 30.00, false),
(2, 'Digital Service Tax', 'fixed', 45.00, false),
-- Mike's taxes
(3, 'Standard Rate', 'percentage', 21.00, true),
(3, 'Fixed Admin Fee', 'fixed', 20.00, false),
(3, 'Premium Service Tax', 'fixed', 50.00, false);

-- Insert Discounts with user ownership
INSERT INTO `Discount` (created_by_user_id, name, type, value, is_active) VALUES
-- John's discounts
(1, 'Early Payment', 'percentage', 5.00, true),
(1, 'Bulk Purchase', 'fixed', 100.00, true),
(1, 'New Client', 'percentage', 10.00, true),
(1, 'Holiday Special', 'percentage', 15.00, false),
-- Sarah's discounts
(2, 'Loyalty Discount', 'percentage', 10.00, true),
(2, 'Early Payment', 'percentage', 5.00, true),
(2, 'Volume Discount', 'fixed', 250.00, true),
(2, 'Seasonal Offer', 'percentage', 20.00, false),
-- Mike's discounts
(3, 'First Time', 'percentage', 15.00, true),
(3, 'Referral Bonus', 'fixed', 50.00, true),
(3, 'Long Term Client', 'percentage', 12.00, true);

-- Insert Invoices
INSERT INTO `Invoice` (
    invoice_number, client_id, created_by_user_id, template_id, 
    creation_date, expiration_date, state, 
    currency, notes, invoice_subject,
    total_amount, subtotal
) VALUES
-- John's invoices
('INV-2024-001', 1, 1, 1, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'sent', 
 'USD', 'Standard payment terms apply', 'Web Development Services', 
 1500.00, 1500.00),
('INV-2024-002', 2, 1, 1, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'paid', 
 'USD', 'Paid in full', 'Consultation Services', 
 200.00, 200.00),
('INV-2024-003', 3, 1, 2, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY), 'overdue', 
 'USD', 'Payment overdue', 'Mobile App Development', 
 2500.00, 2500.00),
('INV-2024-004', 4, 1, 3, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'draft', 
 'EUR', 'Draft invoice', 'SEO Services', 
 750.00, 750.00),
-- Sarah's invoices
('INV-2024-005', 5, 2, 2, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'draft', 
 'USD', 'Hardware purchase order', 'Server Hardware', 
 1999.99, 1999.99),
('INV-2024-006', 6, 2, 1, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 45 DAY), 'sent', 
 'EUR', 'Software licenses', 'Annual License Renewal', 
 1499.99, 1499.99),
('INV-2024-007', 7, 2, 3, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'cancelled', 
 'USD', 'Cancelled by client', 'Cloud Storage Setup', 
 899.99, 899.99),
-- Mike's invoices
('INV-2024-008', 9, 3, 1, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'sent', 
 'USD', 'Data analysis project', 'Data Analysis Services', 
 2250.00, 2250.00),
('INV-2024-009', 10, 3, 2, 
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 DAY), 'paid', 
 'EUR', 'Security audit completed', 'Security Audit', 
 1500.00, 1500.00);

-- Insert Invoice Lines
INSERT INTO `Invoice_Line` (invoice_id, item_id, quantity, price, description) VALUES
-- Lines for John's invoices
(1, 1, 10, 150.00, 'Web Development - 10 hours'),
(1, 2, 2, 200.00, 'Consultation Sessions'),
(2, 2, 1, 200.00, 'Initial Consultation'),
(3, 3, 15, 175.00, 'Mobile App Development'),
(3, 2, 2, 200.00, 'Planning Sessions'),
(4, 4, 1, 500.00, 'Complete SEO Package'),
-- Lines for Sarah's invoices
(5, 7, 1, 1999.99, 'High-Performance Server'),
(6, 8, 3, 499.99, 'Software Licenses - 3 users'),
(6, 10, 2, 150.00, 'Setup Support'),
(7, 9, 3, 299.99, 'Cloud Storage - 3 year plan'),
-- Lines for Mike's invoices
(8, 13, 10, 225.00, 'Data Analysis - 10 hours'),
(9, 16, 2, 750.00, 'Security Audit - Two locations');

-- Insert Invoice Taxes
INSERT INTO `Invoice_Tax` (invoice_id, tax_id) VALUES
-- Taxes for John's invoices
(1, 1),
(1, 4),
(2, 1),
(3, 2),
(3, 3),
(4, 3),
-- Taxes for Sarah's invoices
(5, 5),
(5, 7),
(6, 8),
(7, 6),
-- Taxes for Mike's invoices
(8, 9),
(8, 10),
(9, 11);

-- Insert Invoice Discounts
INSERT INTO `Invoice_Discount` (invoice_id, discount_id) VALUES
-- Discounts for John's invoices
(1, 1),
(2, 3),
(3, 2),
-- Discounts for Sarah's invoices
(5, 5),
(6, 7),
-- Discounts for Mike's invoices
(8, 9),
(9, 11); -- Long Term Client

-- Insert Invoice History
INSERT INTO `Invoice_History` (
    invoice_id, 
    previous_state, 
    new_state, 
    changed_by_user_id
) VALUES
(1, 'draft', 'sent', 1),
(2, 'draft', 'sent', 1),
(2, 'sent', 'paid', 1),
(3, 'draft', 'sent', 1),
(3, 'sent', 'overdue', 1),
(5, 'draft', 'sent', 2),
(6, 'draft', 'sent', 2),
(7, 'draft', 'sent', 2),
(7, 'sent', 'cancelled', 2),
(8, 'draft', 'sent', 3),
(9, 'draft', 'sent', 3),
(9, 'sent', 'paid', 3);

-- Insert Attachments
INSERT INTO `Attachment` (
    invoice_id, 
    file_name, 
    file_data, 
    extension
) VALUES
(1, 'invoice-001-details', UNHEX('89504E470D0A1A0A'), 'pdf'),
(1, 'invoice-001-specs', UNHEX('89504E470D0A1A0A'), 'docx'),
(2, 'receipt-002', UNHEX('89504E470D0A1A0A'), 'pdf'),
(3, 'invoice-003-details', UNHEX('89504E470D0A1A0A'), 'pdf'),
(5, 'hardware-specs', UNHEX('89504E470D0A1A0A'), 'pdf'),
(6, 'license-details', UNHEX('89504E470D0A1A0A'), 'pdf'),
(8, 'analysis-report', UNHEX('89504E470D0A1A0A'), 'pdf'),
(9, 'audit-findings', UNHEX('89504E470D0A1A0A'), 'pdf'),
(9, 'security-recommendations', UNHEX('89504E470D0A1A0A'), 'docx');

SET FOREIGN_KEY_CHECKS = 1;