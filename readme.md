# Invoice Manager

An application to generate customized invoices in various formats, with dynamic invoice numbering and database storage for tracking and management.

---

## CI/CD

[![CI - Static Analysis & Formatting](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/ci-code-quality.yml/badge.svg?branch=develop)](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/ci-code-quality.yml)
[![CodeQL](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/github-code-scanning/codeql/badge.svg?branch=develop)](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/github-code-scanning/codeql)
[![Dependabot Updates](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/dependabot/dependabot-updates/badge.svg?branch=develop)](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/dependabot/dependabot-updates)
[![Dependency review](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/dependency-review.yml/badge.svg?branch=develop)](https://github.com/ESGI-Enzo-Damien-Jory/InvoiceManager/actions/workflows/dependency-review.yml)

---

## Table of Contents

- [Invoice Manager](#invoice-manager)
    - [CI/CD](#cicd)
    - [Table of Contents](#table-of-contents)
    - [Features](#features)
    - [Quick Start](#quick-start)
    - [Documentation](#documentation)
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
    git clone git@github.com:ESGI-Enzo-Damien-Jory/InvoiceManager.git
    ```

2. **Navigate to the Project Directory**:

    ```bash
    cd InvoiceManager
    ```

3. **Getting Started**

    ```bash
    pnpm i
    turbo dev
    ```

4. **Access the Application**:

    Open your web browser and navigate to `http://localhost:3000`.

---

## Documentation

> Under Construction

For comprehensive information on installation, configuration, usage, and more, please refer to our **[Documentation]**

## Technologies Used

- **Frontend**: React with Shadcn
- **Backend**: Node.js with Adonis
- **Database**: Postgres (Supabase)
- **CI/CD**: GitHub Actions

---

## Project Structure

- **/apps/frontend**: Frontend source code
- **/apps/backend**: Backend source code

---

## Acknowledgments

A big thank you to all the contributors who helped develop this project.

---

## Disclaimer

This software is provided "as is", without warranty of any kind.
