USE Invoice_Manager;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET @existing_user_id = 6;

-- Insert all clients
INSERT INTO `Client` (created_by_user_id, email, phone, type, address, is_active) VALUES
(@existing_user_id, 'techvision@example.com', '555-0301', 'company', '123 Innovation Street', true),
(@existing_user_id, 'mark.developer@example.com', '555-0302', 'individual', '456 Coder Lane', true),
(@existing_user_id, 'cloudforce@example.com', '555-0303', 'company', '789 Cloud Avenue', true),
(@existing_user_id, 'greenenergy@example.com', '555-0401', 'company', '123 Solar Way', true),
(@existing_user_id, 'jane.doe@example.com', '555-0402', 'individual', '789 Elm Street', true),
(@existing_user_id, 'fintechsolutions@example.com', '555-0403', 'company', '456 Finance Blvd', true),
(@existing_user_id, 'john.smith@example.com', '555-0404', 'individual', '101 Oak Avenue', true),
(@existing_user_id, 'healthtech@example.com', '555-0501', 'company', '789 Medical Drive', true),
(@existing_user_id, 'sarah.architect@example.com', '555-0502', 'individual', '321 Design Street', true),
(@existing_user_id, 'edulearn@example.com', '555-0503', 'company', '456 Campus Road', true),
(@existing_user_id, 'robert.consultant@example.com', '555-0504', 'individual', '567 Consulting Ave', true),
(@existing_user_id, 'retailpro@example.com', '555-0505', 'company', '890 Shopping Plaza', true),
(@existing_user_id, 'foodservices@example.com', '555-0506', 'company', '123 Restaurant Row', true),
(@existing_user_id, 'emma.designer@example.com', '555-0507', 'individual', '432 Creative Lane', true),
(@existing_user_id, 'sportsequip@example.com', '555-0508', 'company', '765 Fitness Way', true),
(@existing_user_id, 'david.writer@example.com', '555-0509', 'individual', '543 Author Street', true),
(@existing_user_id, 'realestate@example.com', '555-0510', 'company', '999 Property Circle', true);

-- Store all client IDs
SET @client_company_1 = LAST_INSERT_ID();
SET @client_individual_1 = @client_company_1 + 1;
SET @client_company_2 = @client_company_1 + 2;
SET @client_company_3 = @client_company_1 + 3;
SET @client_individual_2 = @client_company_1 + 4;
SET @client_company_4 = @client_company_1 + 5;
SET @client_individual_3 = @client_company_1 + 6;
SET @client_company_5 = @client_company_1 + 7;
SET @client_individual_4 = @client_company_1 + 8;
SET @client_company_6 = @client_company_1 + 9;
SET @client_individual_5 = @client_company_1 + 10;
SET @client_company_7 = @client_company_1 + 11;
SET @client_company_8 = @client_company_1 + 12;
SET @client_individual_6 = @client_company_1 + 13;
SET @client_company_9 = @client_company_1 + 14;
SET @client_individual_7 = @client_company_1 + 15;
SET @client_company_10 = @client_company_1 + 16;

-- Insert all company details
INSERT INTO `Client_Company` (client_id, company_name, contact_name) VALUES
(@client_company_1, 'TechVision Solutions', 'Alex Turner'),
(@client_company_2, 'CloudForce Systems', 'Jennifer Cloud'),
(@client_company_3, 'Green Energy Solutions', 'Laura Green'),
(@client_company_4, 'FinTech Solutions', 'Michael Fin'),
(@client_company_5, 'HealthTech Innovations', 'Maria Health'),
(@client_company_6, 'EduLearn Solutions', 'Peter Education'),
(@client_company_7, 'RetailPro Systems', 'Rachel Retail'),
(@client_company_8, 'FoodService Excellence', 'Gordon Chef'),
(@client_company_9, 'SportsFit Equipment', 'Mike Fitness'),
(@client_company_10, 'RealEstate Pros', 'Diana Property');

-- Insert all individual details
INSERT INTO `Client_Individual` (client_id, first_name, last_name) VALUES
(@client_individual_1, 'Mark', 'Developer'),
(@client_individual_2, 'Jane', 'Doe'),
(@client_individual_3, 'John', 'Smith'),
(@client_individual_4, 'Sarah', 'Architect'),
(@client_individual_5, 'Robert', 'Consultant'),
(@client_individual_6, 'Emma', 'Designer'),
(@client_individual_7, 'David', 'Writer');

-- Insert items for the existing user
INSERT INTO `Item` (created_by_user_id, name, description, default_price, type, is_active) VALUES
(@existing_user_id, 'Full Stack Development', 'Complete web application development', 200.00, 'service', true),
(@existing_user_id, 'Database Design', 'Custom database architecture', 175.00, 'service', true),
(@existing_user_id, 'AWS Setup', 'AWS cloud infrastructure setup', 250.00, 'service', true),
(@existing_user_id, 'Monthly Maintenance', 'System maintenance and updates', 100.00, 'service', true),
(@existing_user_id, 'Laptop', 'High-performance laptop for developers', 1200.00, 'product', true),
(@existing_user_id, 'Monitor', '27-inch 4K UHD Monitor', 400.00, 'product', true),
(@existing_user_id, 'Keyboard', 'Mechanical keyboard with backlight', 100.00, 'product', true),
(@existing_user_id, 'Mouse', 'Wireless ergonomic mouse', 50.00, 'product', true),
(@existing_user_id, 'Consultation', 'One-hour tech consultation service', 100.00, 'service', false),
(@existing_user_id, 'Software Installation', 'Installation of software and updates', 50.00, 'service', false),
(@existing_user_id, 'System Optimization', 'Comprehensive system performance optimization', 150.00, 'service', false),
(@existing_user_id, 'Data Backup', 'Secure data backup service', 80.00, 'service', false),
(@existing_user_id, 'Printer', 'All-in-one wireless printer', 200.00, 'product', false),
(@existing_user_id, 'Webcam', '1080p HD webcam with built-in microphone', 80.00, 'product', false),
(@existing_user_id, 'Docking Station', 'USB-C docking station with multiple ports', 150.00, 'product', false),
(@existing_user_id, 'External Hard Drive', '1TB portable external hard drive', 70.00, 'product', false);

-- Insert taxes for the existing user
INSERT INTO `Tax` (created_by_user_id, name, type, value, apply_by_default) VALUES
(@existing_user_id, 'Standard VAT', 'percentage', 20.00, true),
(@existing_user_id, 'Service Fee', 'fixed', 25.00, false);

-- Insert discounts for the existing user
INSERT INTO `Discount` (created_by_user_id, name, type, value, is_active) VALUES
(@existing_user_id, 'Startup Discount', 'percentage', 15.00, true),
(@existing_user_id, 'Package Deal', 'fixed', 200.00, true);

-- Insert invoices for the existing user
INSERT INTO `Invoice` (
    invoice_number, 
    client_id, 
    created_by_user_id, 
    template_id,
    creation_date, 
    expiration_date, 
    state, 
    currency, 
    notes, 
    invoice_subject,
    total_amount, 
    subtotal
) VALUES
('INV-2024-201', @client_company_1, @existing_user_id, 1,
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY),
 'draft', 'USD', 'Full stack development project',
 'Web Application Development', 4000.00, 4000.00),
 
('INV-2024-202', @client_individual_1, @existing_user_id, 2,
 CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY),
 'sent', 'USD', 'Database design and implementation',
 'Database Project', 2500.00, 2500.00);

-- Store the invoice IDs
SET @invoice_1 = LAST_INSERT_ID();
SET @invoice_2 = @invoice_1 + 1;

-- Insert invoice lines
INSERT INTO `Invoice_Line` (invoice_id, item_id, quantity, price, description) VALUES
(@invoice_1, LAST_INSERT_ID() - 3, 20, 200.00, 'Full Stack Development - 20 hours'),
(@invoice_2, LAST_INSERT_ID() - 2, 10, 175.00, 'Database Design and Implementation');

-- Apply taxes and discounts
INSERT INTO `Invoice_Tax` (invoice_id, tax_id) 
SELECT @invoice_1, id FROM Tax WHERE created_by_user_id = @existing_user_id AND apply_by_default = true;

INSERT INTO `Invoice_Discount` (invoice_id, discount_id)
SELECT @invoice_1, id FROM Discount WHERE created_by_user_id = @existing_user_id AND name = 'Startup Discount';

-- Insert invoice history
INSERT INTO `Invoice_History` (invoice_id, previous_state, new_state, changed_by_user_id) VALUES
(@invoice_2, 'draft', 'sent', @existing_user_id);

-- Commit transaction
COMMIT;
SET FOREIGN_KEY_CHECKS = 1;