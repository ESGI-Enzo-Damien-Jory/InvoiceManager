DROP DATABASE IF EXISTS Invoice_Manager;
CREATE DATABASE Invoice_Manager
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE Invoice_Manager;

CREATE TABLE `User` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `clerk_user_id` VARCHAR(255) NOT NULL UNIQUE,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `role` ENUM('manager', 'admin') NOT NULL DEFAULT 'manager',
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_email UNIQUE (email),
    CONSTRAINT unique_username UNIQUE (username)
);

CREATE TABLE `Client` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `type` ENUM('individual', 'company') NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `image` MEDIUMBLOB NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `User`(`id`),
    CONSTRAINT unique_client_email_per_user UNIQUE (email, created_by_user_id)
);

CREATE TABLE `Client_Individual` (
    `client_id` INT UNSIGNED NOT NULL PRIMARY KEY,
    `last_name` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE
);

CREATE TABLE `Client_Company` (
    `client_id` INT UNSIGNED NOT NULL PRIMARY KEY,
    `company_name` VARCHAR(255) NOT NULL,
    `contact_name` VARCHAR(255) NULL,
    FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE
);

CREATE TABLE `Template` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `template_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Invoice` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `invoice_number` VARCHAR(50) NOT NULL,
    `client_id` INT UNSIGNED NOT NULL,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `template_id` INT UNSIGNED NOT NULL,
    `creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expiration_date` TIMESTAMP NOT NULL,
    `state` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft',
    `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL,
    `notes` TEXT NULL,
    `invoice_subject` VARCHAR(255) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_invoice_number UNIQUE (invoice_number),
    FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`),
    FOREIGN KEY (`created_by_user_id`) REFERENCES `User`(`id`),
    FOREIGN KEY (`template_id`) REFERENCES `Template`(`id`)
);

CREATE TABLE `Item` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `default_price` DECIMAL(10, 2) NOT NULL,
    `type` ENUM('product', 'service') NOT NULL,
    `image` MEDIUMBLOB NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `User`(`id`),
    CONSTRAINT check_positive_default_price CHECK (default_price >= 0),
    CONSTRAINT unique_item_name_per_user UNIQUE (name, created_by_user_id)
);

CREATE TABLE `Invoice_Line` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT UNSIGNED NOT NULL,
    `item_id` INT UNSIGNED NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE SET NULL,
    CONSTRAINT check_positive_quantity CHECK (quantity > 0),
    CONSTRAINT check_positive_price CHECK (price >= 0)
);

CREATE TABLE `Tax` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `rate` DECIMAL(8, 2) NOT NULL,
    `apply_by_default` BOOLEAN NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `User`(`id`),
    CONSTRAINT check_valid_tax_rate CHECK (rate >= 0 AND rate <= 100),
    CONSTRAINT unique_tax_name_per_user UNIQUE (name, created_by_user_id)
);

CREATE TABLE `Discount` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `created_by_user_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('percentage', 'fixed') NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by_user_id`) REFERENCES `User`(`id`),
    CONSTRAINT check_valid_discount CHECK (
        (type = 'percentage' AND value >= 0 AND value <= 100) OR
        (type = 'fixed' AND value >= 0)
    ),
    CONSTRAINT unique_discount_name_per_user UNIQUE (name, created_by_user_id)
);

CREATE TABLE `Invoice_Tax` (
    `invoice_id` INT UNSIGNED NOT NULL,
    `tax_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY(`invoice_id`, `tax_id`),
    FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tax_id`) REFERENCES `Tax`(`id`)
);

CREATE TABLE `Invoice_Discount` (
    `invoice_id` INT UNSIGNED NOT NULL,
    `discount_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY(`invoice_id`, `discount_id`),
    FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`discount_id`) REFERENCES `Discount`(`id`)
);

CREATE TABLE `Invoice_History` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT UNSIGNED NOT NULL,
    `previous_state` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NOT NULL,
    `new_state` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NOT NULL,
    `state_change_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `changed_by_user_id` INT UNSIGNED NULL,
    FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`changed_by_user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL
);

CREATE TABLE `Invoice_Log` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT UNSIGNED NOT NULL,
    `modification_type` ENUM(
        'create',
        'update',
        'delete',
        'tax_added',
        'tax_removed',
        'discount_added',
        'discount_removed',
        'line_item_added',
        'line_item_updated',
        'line_item_removed',
        'state_changed',
        'amount_changed'
    ) NOT NULL,
    `tax_id` INT UNSIGNED NULL,
    `tax_name` VARCHAR(255) NULL,
    `tax_rate` DECIMAL(8, 2) NULL,
    `discount_id` INT UNSIGNED NULL,
    `discount_name` VARCHAR(255) NULL,
    `discount_type` ENUM('percentage', 'fixed') NULL,
    `discount_value` DECIMAL(10, 2) NULL,
    `line_item_id` INT UNSIGNED NULL,
    `item_id` INT UNSIGNED NULL,
    `previous_quantity` INT NULL,
    `new_quantity` INT NULL,
    `previous_price` DECIMAL(10, 2) NULL,
    `new_price` DECIMAL(10, 2) NULL,
    `item_description` TEXT NULL,
    `previous_state` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NULL,
    `new_state` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NULL,
    `previous_subtotal` DECIMAL(10, 2) NULL,
    `new_subtotal` DECIMAL(10, 2) NULL,
    `previous_total` DECIMAL(10, 2) NULL,
    `new_total` DECIMAL(10, 2) NULL,
    `previous_subject` VARCHAR(255) NULL,
    `new_subject` VARCHAR(255) NULL,
    `previous_notes` TEXT NULL,
    `new_notes` TEXT NULL,
    `previous_expiration_date` TIMESTAMP NULL,
    `new_expiration_date` TIMESTAMP NULL,
    `modification_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `changed_by_user_id` INT UNSIGNED NULL,
    `details` VARCHAR(255) NULL,
    FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`),
    FOREIGN KEY (`changed_by_user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`tax_id`) REFERENCES `Tax`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`discount_id`) REFERENCES `Discount`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE SET NULL
);

CREATE TABLE `Attachment` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT UNSIGNED NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_data` MEDIUMBLOB NOT NULL,
    `extension` ENUM('pdf', 'jpg', 'png', 'docx', 'txt') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_invoice_state ON Invoice(state);
CREATE INDEX idx_invoice_creation_date ON Invoice(creation_date);
CREATE INDEX idx_invoice_expiration_date ON Invoice(expiration_date);
CREATE INDEX idx_client_user ON Client(created_by_user_id);
CREATE INDEX idx_client_email ON Client(email);
CREATE INDEX idx_client_active_user ON Client(is_active, created_by_user_id);
CREATE INDEX idx_invoice_number ON Invoice(invoice_number);
CREATE INDEX idx_tax_user ON Tax(created_by_user_id);
CREATE INDEX idx_discount_user ON Discount(created_by_user_id);
CREATE INDEX idx_item_user ON Item(created_by_user_id);
CREATE INDEX idx_item_name ON Item(name);
CREATE INDEX idx_invoice_log_type_timestamp ON Invoice_Log(modification_type, modification_timestamp);
CREATE INDEX idx_invoice_log_invoice_timestamp ON Invoice_Log(invoice_id, modification_timestamp);
CREATE INDEX idx_invoice_log_user ON Invoice_Log(changed_by_user_id);
CREATE INDEX idx_invoice_log_tax ON Invoice_Log(tax_id);
CREATE INDEX idx_invoice_log_discount ON Invoice_Log(discount_id);
CREATE INDEX idx_invoice_log_item ON Invoice_Log(item_id);

-- Stored Procedures and Triggers
DELIMITER //

-- Stored Procedure to update the total_amount
CREATE PROCEDURE update_total_amount(IN invoiceId INT UNSIGNED)
BEGIN
    DECLARE var_subtotal DECIMAL(10, 2);
    DECLARE var_total_tax_rate DECIMAL(8, 2);
    DECLARE var_total_discount DECIMAL(10, 2);
    DECLARE var_final_amount DECIMAL(10, 2);

    SELECT COALESCE(subtotal, 0) INTO var_subtotal 
    FROM Invoice 
    WHERE id = invoiceId;

    SELECT COALESCE(SUM(rate), 0) INTO var_total_tax_rate
    FROM Tax t
    INNER JOIN Invoice_Tax it ON t.id = it.tax_id
    WHERE it.invoice_id = invoiceId;

    SELECT COALESCE(SUM(
        CASE 
            WHEN d.type = 'fixed' THEN d.value
            WHEN d.type = 'percentage' THEN (var_subtotal * d.value / 100)
            ELSE 0
        END
    ), 0) INTO var_total_discount
    FROM Discount d
    INNER JOIN Invoice_Discount id ON d.id = id.discount_id
    WHERE id.invoice_id = invoiceId;

    SET var_final_amount = COALESCE(var_subtotal + (var_subtotal * var_total_tax_rate / 100) - var_total_discount, 0);

    UPDATE Invoice
    SET total_amount = var_final_amount
    WHERE id = invoiceId;
END//

-- Trigger for checking expiration_date is not earlier than creation_date
CREATE TRIGGER before_invoice_insert 
BEFORE INSERT ON Invoice
FOR EACH ROW 
BEGIN
    IF NEW.expiration_date < NEW.creation_date THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Expiration date cannot be earlier than creation date';
    END IF;
END//

-- Trigger for logging state changes into Invoice_History
CREATE TRIGGER after_invoice_state_change
AFTER UPDATE ON Invoice
FOR EACH ROW
BEGIN
    IF OLD.state != NEW.state THEN
        INSERT INTO Invoice_History (
            invoice_id,
            previous_state,
            new_state,
            changed_by_user_id
        ) VALUES (
            NEW.id,
            OLD.state,
            NEW.state,
            IFNULL(@current_user_id, NULL)
        );
    END IF;
END//

-- Trigger for logging INSERT into Invoice_Log when a new invoice is created
CREATE TRIGGER after_invoice_insert
AFTER INSERT ON Invoice
FOR EACH ROW
BEGIN
    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        new_state,
        new_total,
        new_subtotal,
        new_subject,
        new_notes,
        new_expiration_date,
        changed_by_user_id,
        details
    ) VALUES (
        NEW.id,
        'create',
        NEW.state,
        NEW.total_amount,
        NEW.subtotal,
        NEW.invoice_subject,
        NEW.notes,
        NEW.expiration_date,
        IFNULL(@current_user_id, NULL),
        'New invoice creation'
    );
END//

-- Trigger for logging UPDATE into Invoice_Log when an invoice is updated
CREATE TRIGGER after_invoice_update
AFTER UPDATE ON Invoice
FOR EACH ROW
BEGIN
    IF OLD.state != NEW.state THEN
        INSERT INTO Invoice_Log (
            invoice_id,
            modification_type,
            previous_state,
            new_state,
            modification_timestamp,
            changed_by_user_id,
            details
        ) VALUES (
            NEW.id,
            'state_changed',
            OLD.state,
            NEW.state,
            CURRENT_TIMESTAMP,
            IFNULL(@current_user_id, NULL),
            'Invoice state changed'
        );
    END IF;

    IF OLD.total_amount != NEW.total_amount OR OLD.subtotal != NEW.subtotal THEN
        INSERT INTO Invoice_Log (
            invoice_id,
            modification_type,
            previous_subtotal,
            new_subtotal,
            previous_total,
            new_total,
            modification_timestamp,
            changed_by_user_id,
            details
        ) VALUES (
            NEW.id,
            'amount_changed',
            OLD.subtotal,
            NEW.subtotal,
            OLD.total_amount,
            NEW.total_amount,
            CURRENT_TIMESTAMP,
            IFNULL(@current_user_id, NULL),
            'Invoice amounts updated'
        );
    END IF;

    IF OLD.invoice_subject != NEW.invoice_subject OR OLD.notes != NEW.notes OR OLD.expiration_date != NEW.expiration_date THEN
        INSERT INTO Invoice_Log (
            invoice_id,
            modification_type,
            previous_subject,
            new_subject,
            previous_notes,
            new_notes,
            previous_expiration_date,
            new_expiration_date,
            modification_timestamp,
            changed_by_user_id,
            details
        ) VALUES (
            NEW.id,
            'update',
            OLD.invoice_subject,
            NEW.invoice_subject,
            OLD.notes,
            NEW.notes,
            OLD.expiration_date,
            NEW.expiration_date,
            CURRENT_TIMESTAMP,
            IFNULL(@current_user_id, NULL),
            'Invoice details updated'
        );
    END IF;
END//

-- Trigger for logging DELETE into Invoice_Log when an invoice is deleted
CREATE TRIGGER after_invoice_delete
AFTER DELETE ON Invoice
FOR EACH ROW
BEGIN
    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        previous_state,
        previous_total,
        previous_subtotal,
        previous_subject,
        previous_notes,
        previous_expiration_date,
        modification_timestamp,
        changed_by_user_id,
        details
    ) VALUES (
        OLD.id,
        'delete',
        OLD.state,
        OLD.total_amount,
        OLD.subtotal,
        OLD.invoice_subject,
        OLD.notes,
        OLD.expiration_date,
        CURRENT_TIMESTAMP,
        IFNULL(@current_user_id, NULL),
        'Invoice deleted'
    );
END//

-- Trigger for updating subtotal when an Invoice_Line is inserted
CREATE TRIGGER after_invoice_line_insert
AFTER INSERT ON Invoice_Line
FOR EACH ROW
BEGIN
    DECLARE new_subtotal DECIMAL(10, 2);
    SET new_subtotal = (SELECT COALESCE(SUM(quantity * price), 0)
                        FROM Invoice_Line
                        WHERE invoice_id = NEW.invoice_id);
    
    UPDATE Invoice
    SET subtotal = new_subtotal
    WHERE id = NEW.invoice_id;
    
    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        line_item_id,
        item_id,
        new_quantity,
        new_price,
        item_description,
        changed_by_user_id,
        details
    ) VALUES (
        NEW.invoice_id,
        'line_item_added',
        NEW.id,
        NEW.item_id,
        NEW.quantity,
        NEW.price,
        NEW.description,
        IFNULL(@current_user_id, NULL),
        'Line item added'
    );
    
    CALL update_total_amount(NEW.invoice_id);
END//

-- Trigger for updating subtotal when an Invoice_Line is updated
CREATE TRIGGER after_invoice_line_update
AFTER UPDATE ON Invoice_Line
FOR EACH ROW
BEGIN
    DECLARE new_subtotal DECIMAL(10, 2);
    SET new_subtotal = (SELECT COALESCE(SUM(quantity * price), 0)
                        FROM Invoice_Line
                        WHERE invoice_id = NEW.invoice_id);
    
    UPDATE Invoice
    SET subtotal = new_subtotal
    WHERE id = NEW.invoice_id;
    
    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        line_item_id,
        item_id,
        previous_quantity,
        new_quantity,
        previous_price,
        new_price,
        item_description,
        changed_by_user_id,
        details
    ) VALUES (
        NEW.invoice_id,
        'line_item_updated',
        NEW.id,
        NEW.item_id,
        OLD.quantity,
        NEW.quantity,
        OLD.price,
        NEW.price,
        NEW.description,
        IFNULL(@current_user_id, NULL),
        'Line item updated'
    );
    
    CALL update_total_amount(NEW.invoice_id);
END//

-- Trigger for updating subtotal when an Invoice_Line is deleted
CREATE TRIGGER after_invoice_line_delete
AFTER DELETE ON Invoice_Line
FOR EACH ROW
BEGIN
    DECLARE new_subtotal DECIMAL(10, 2);
    SET new_subtotal = (SELECT COALESCE(SUM(quantity * price), 0)
                        FROM Invoice_Line
                        WHERE invoice_id = OLD.invoice_id);
    
    UPDATE Invoice
    SET subtotal = new_subtotal
    WHERE id = OLD.invoice_id;
    
    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        line_item_id,
        item_id,
        previous_quantity,
        previous_price,
        item_description,
        changed_by_user_id,
        details
    ) VALUES (
        OLD.invoice_id,
        'line_item_removed',
        OLD.id,
        OLD.item_id,
        OLD.quantity,
        OLD.price,
        OLD.description,
        IFNULL(@current_user_id, NULL),
        'Line item removed'
    );
    
    CALL update_total_amount(OLD.invoice_id);
END//

-- Trigger for updating total_amount when a tax is applied or removed
CREATE TRIGGER after_invoice_tax_change
AFTER INSERT ON Invoice_Tax
FOR EACH ROW
BEGIN
    SELECT name, rate 
    INTO @tax_name, @tax_rate
    FROM Tax 
    WHERE id = NEW.tax_id;

    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        tax_id,
        tax_name,
        tax_rate,
        changed_by_user_id,
        details
    ) VALUES (
        NEW.invoice_id,
        'tax_added',
        NEW.tax_id,
        @tax_name,
        @tax_rate,
        IFNULL(@current_user_id, NULL),
        'Tax added to invoice'
    );
    
    CALL update_total_amount(NEW.invoice_id);
END//

CREATE TRIGGER after_invoice_tax_delete
AFTER DELETE ON Invoice_Tax
FOR EACH ROW
BEGIN
    SELECT name, rate 
    INTO @tax_name, @tax_rate
    FROM Tax 
    WHERE id = OLD.tax_id;

    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        tax_id,
        tax_name,
        tax_rate,
        changed_by_user_id,
        details
    ) VALUES (
        OLD.invoice_id,
        'tax_removed',
        OLD.tax_id,
        @tax_name,
        @tax_rate,
        IFNULL(@current_user_id, NULL),
        'Tax removed from invoice'
    );
    
    CALL update_total_amount(OLD.invoice_id);
END//

CREATE TRIGGER after_invoice_discount_change
AFTER INSERT ON Invoice_Discount
FOR EACH ROW
BEGIN
    SELECT name, type, value 
    INTO @discount_name, @discount_type, @discount_value
    FROM Discount 
    WHERE id = NEW.discount_id;

    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        discount_id,
        discount_name,
        discount_type,
        discount_value,
        changed_by_user_id,
        details
    ) VALUES (
        NEW.invoice_id,
        'discount_added',
        NEW.discount_id,
        @discount_name,
        @discount_type,
        @discount_value,
        IFNULL(@current_user_id, NULL),
        'Discount added to invoice'
    );
    
    CALL update_total_amount(NEW.invoice_id);
END//

CREATE TRIGGER after_invoice_discount_delete
AFTER DELETE ON Invoice_Discount
FOR EACH ROW
BEGIN
    SELECT name, type, value 
    INTO @discount_name, @discount_type, @discount_value
    FROM Discount 
    WHERE id = OLD.discount_id;

    INSERT INTO Invoice_Log (
        invoice_id,
        modification_type,
        discount_id,
        discount_name,
        discount_type,
        discount_value,
        changed_by_user_id,
        details
    ) VALUES (
        OLD.invoice_id,
        'discount_removed',
        OLD.discount_id,
        @discount_name,
        @discount_type,
        @discount_value,
        IFNULL(@current_user_id, NULL),
        'Discount removed from invoice'
    );
    
    CALL update_total_amount(OLD.invoice_id);
END//

DELIMITER ;