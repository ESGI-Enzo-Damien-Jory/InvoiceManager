require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('MySQL Connection Pool', () => {
  let mockGetConnection;
  let pool;

  beforeEach(() => {
    mysql.createPool.mockClear();
    mockGetConnection = jest.fn();

    pool = {
      getConnection: mockGetConnection,
      end: jest.fn().mockResolvedValue(undefined),
    };

    mysql.createPool.mockReturnValue(pool);
  });

  it('should use the correct port when DB_PORT is set', async () => {
    const mockQuery = jest.fn().mockResolvedValue([[{ Value: '3307' }]]);
    mockGetConnection.mockResolvedValue({
      query: mockQuery,
      release: jest.fn(),
    });

    process.env.DB_PORT = '3307';

    const connection = await pool.getConnection();
    const [rows] = await connection.query('SHOW VARIABLES LIKE "port"');

    expect(rows[0].Value).toBe('3307');

    await pool.end();
  });

  it('should use the default port when DB_PORT is not set', async () => {
    const mockQuery = jest.fn().mockResolvedValue([[{ Value: '3306' }]]);
    mockGetConnection.mockResolvedValue({
      query: mockQuery,
      release: jest.fn(),
    });

    delete process.env.DB_PORT;

    const connection = await pool.getConnection();
    const [rows] = await connection.query('SHOW VARIABLES LIKE "port"');

    expect(rows[0].Value).toBe('3306');

    await pool.end();
  });

  it('should handle the case when DB_PORT is set incorrectly', async () => {
    mockGetConnection.mockRejectedValue(new Error('Invalid port'));

    process.env.DB_PORT = 'invalidPort';

    await expect(pool.getConnection()).rejects.toThrow('Invalid port');

    await pool.end();
  });
});
