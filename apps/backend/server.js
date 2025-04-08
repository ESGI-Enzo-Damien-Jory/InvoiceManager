/**
 * @file server.js
 * @module server
 * @description This file initializes the Express server and establishes a connection to the database.
 * The server runs on a specified port and connects to a MySQL database pool.
 */

const app = require('./app');
const pool = require('./config/database');
const port = 3001;

/**
 * Immediately invoked function to connect to the database and start the server.
 *
 * @async
 * @function initServer
 * @memberof module:server
 * @description Attempts to establish a connection to the database pool. If successful,
 * the server listens on the specified port. If the connection fails, the process exits
 * with an error code.
 */
(async function initServer() {
  try {
    /**
     * Establishes a connection to the MySQL database using the pool.
     *
     * @async
     * @function connectDatabase
     * @throws Will throw an error if the connection to the database fails.
     */
    await pool.getConnection();
    console.log('Connected to the database successfully.');

    /**
     * Starts the Express server and listens on the specified port.
     *
     * @function startServer
     * @param {number} port - The port number on which the server listens.
     * @memberof module:server
     * @callback
     */
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    /**
     * Logs an error message and exits the process if the database connection fails.
     *
     * @function handleError
     * @param {Error} error - The error object that contains the message explaining why the connection failed.
     */
    console.error('Error connecting to the database:', error.message);
    process.exit(1);
  }
})();
