const { MySqlContainer } = require('@testcontainers/mysql');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

let container;
let pool;

async function initDatabase() {
  try {
    await startMySQLContainer();

    await setupDatabase();

    pool = require('../../config/database');

    return { pool, container };
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

async function startMySQLContainer() {
  const rootPassword = process.env.TEST_DB_ROOT_PASSWORD;
  const databaseName = process.env.TEST_DB_NAME;

  container = await new MySqlContainer()
    .withRootPassword(rootPassword)
    .withDatabase(databaseName)
    .start();

  process.env.TEST_DB_HOST = container.getHost();
  process.env.TEST_DB_PORT = container.getPort();
}

async function setupDatabase() {
  const rootUser = process.env.TEST_DB_ROOT_USER;
  const rootPassword = process.env.TEST_DB_ROOT_PASSWORD;
  const databaseName = process.env.TEST_DB_NAME;

  const tempConnection = await createConnection({
    user: rootUser,
    password: rootPassword,
    database: databaseName,
  });

  await executeSqlScripts(tempConnection);
  await createTestUser(tempConnection);

  await tempConnection.end();
}

async function createConnection({ user, password, database }) {
  return await mysql.createConnection({
    host: process.env.TEST_DB_HOST,
    port: process.env.TEST_DB_PORT,
    user,
    password,
    database,
    multipleStatements: true,
  });
}

async function executeSqlScripts(connection) {
  const schemaSql = loadSqlFile('../../bin/schema.sql');
  const populateSql = loadSqlFile('../../bin/populate.sql');

  await connection.query(schemaSql);
  await connection.query(populateSql);
}

function loadSqlFile(relativeFilePath) {
  const filePath = path.resolve(__dirname, relativeFilePath);
  return fs.readFileSync(filePath, 'utf8');
}

async function createTestUser(connection) {
  const testUser = process.env.TEST_DB_USER;
  const testPassword = process.env.TEST_DB_PASSWORD;
  const databaseName = process.env.TEST_DB_NAME;

  const createUserSql = `
    CREATE USER '${testUser}'@'%' IDENTIFIED BY '${testPassword}';
    GRANT ALL PRIVILEGES ON ${databaseName}.* TO '${testUser}'@'%';
    FLUSH PRIVILEGES;
  `;

  await connection.query(createUserSql);
}

async function teardownDatabase() {
  try {
    if (pool) {
      await pool.end();
    }
    if (container) {
      await container.stop();
    }
  } catch (error) {
    console.error('Error during database teardown:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  teardownDatabase,
};
