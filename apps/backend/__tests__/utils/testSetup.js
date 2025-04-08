const express = require('express');
const { initDatabase, teardownDatabase } = require('./testUtils');

let pool, container, app;

async function setupTestEnvironment(routerPath) {
  const dbInit = await initDatabase();
  pool = dbInit.pool;
  container = dbInit.container;

  const router = require('../' + routerPath);
  app = express();
  app.use(express.json());
  app.use('/', router);

  return { pool, container, app };
}

async function teardownTestEnvironment() {
  await teardownDatabase();
}

module.exports = {
  setupTestEnvironment,
  teardownTestEnvironment,
};
