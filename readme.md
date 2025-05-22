# Invoice Manager

An application to generate customized invoices in various formats, with dynamic invoice numbering and database storage for tracking and management.

---

## CI/CD & Test Status

<div align="center">
  <table>
    <tr>
      <td><img src="https://github.com/Darleanow/InvoiceManager/actions/workflows/main.yml/badge.svg" alt="Unit Tests"></td>
      <td><img src="https://coveralls.io/repos/github/Darleanow/InvoiceManager/badge.svg?branch=develop" alt="Coverage Status"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=alert_status" alt="Quality Gate Status"></td>
    </tr>
  </table>
</div>

---

## Test Reports

**[View Test Reports](https://darleanow.github.io/InvoiceManager/index.html)**

---

## Table of Contents

- [Invoice Manager](#invoice-manager)
  - [CI/CD \& Test Status](#cicd--test-status)
  - [Test Reports](#test-reports)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Documentation](#documentation)
  - [Project Metrics](#project-metrics)
  - [Security \& Maintainability](#security--maintainability)
  - [Technologies Used](#technologies-used)
  - [Project Structure](#project-structure)
  - [Acknowledgments](#acknowledgments)
  - [Disclaimer](#disclaimer)

---

## Features

- **Custom Invoice Generation**: Generate invoices in Word (.docx), PDF, and .txt formats with dynamic data replacement.
- **User-Friendly Invoice Form**: Enter client details, invoice items, and more via an intuitive form with data validation.
- **Automatic Invoice Numbering**: Invoice numbers follow a customizable format based on client, year, and month, with automatic incrementation.
- **Database Storage**: Store invoices and management rules in a database for full tracking and dynamic management.
- **History and Re-Editing**: View, filter, re-edit, and resend invoices through a dedicated interface.
- **Multi-Format Export**: Export invoices in `.docx`, `.pdf`, or `.txt` formats.
- **Customizable Numbering Rules**: Modify invoice numbering rules via the interface, including adding clients and changing formats.

---

## Quick Start

To quickly start using the Invoice Manager application, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Darleanow/InvoiceManager.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd InvoiceManager
   ```

3. **Install Dependencies**:

   - **Backend**:

     ```bash
     cd backend
     npm install
     ```

   - **Frontend**:

     ```bash
     cd ../frontend
     npm install
     ```

4. **Set Up the Database**:

   - Ensure you have MySQL installed.
   - Create a new database for the application.
   - Update the database configuration in the backend's `config` file.

5. **Run the Application**:

   - **Backend**:

     ```bash
     cd ../backend
     npm start
     ```

   - **Frontend**:

     ```bash
     cd ../frontend
     npm start
     ```

6. **Access the Application**:

   Open your web browser and navigate to `http://localhost:3000`.

> Under Construction

For detailed installation and configuration instructions, please refer to the **[Installation Guide]**.

---

## Documentation

> Under Construction

For comprehensive information on installation, configuration, usage, and more, please refer to our **[Documentation]**

---

## Project Metrics

<div align="center">
  <table>
    <tr>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=bugs" alt="Bugs"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=code_smells" alt="Code Smells"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=duplicated_lines_density" alt="Duplicated Lines (%)"></td>
    </tr>
    <tr>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=ncloc" alt="Lines of Code"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=reliability_rating" alt="Reliability Rating"></td>
    </tr>
  </table>
</div>

---

## Security & Maintainability

<div align="center">
  <table>
    <tr>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=security_rating" alt="Security Rating"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=sqale_index" alt="Technical Debt"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=sqale_rating" alt="Maintainability Rating"></td>
      <td><img src="https://sonarcloud.io/api/project_badges/measure?project=Darleanow_InvoiceManager&metric=vulnerabilities" alt="Vulnerabilities"></td>
    </tr>
  </table>
</div>

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Next.js)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Testing**: Jest, Playwright
- **CI/CD**: GitHub Actions

---

## Project Structure

- **/frontend**: Frontend source code
- **/backend**: Backend source code

---

## Acknowledgments

A big thank you to all the contributors who helped develop this project.

---

## Disclaimer

This software is provided "as is", without warranty of any kind.

---

**Useful Links**:

- **Documentation**: [Under Construction]
- **Website**: [Under Construction]
- **GitHub Repository**: [Darleanow/InvoiceManager](https://github.com/Darleanow/InvoiceManager)
- **Test Reports**: [View Test Reports](https://darleanow.github.io/InvoiceManager/index.html)
---
