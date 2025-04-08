const pool = require('../config/database');

const devAuthMiddleware = async (req, res, next) => {
  try {
    if (req.path === '/users/sync') {
      return next();
    }

    const clerkUserId = req.headers['user-id'];

    if (!clerkUserId) {
      return res
        .status(401)
        .json({ error: 'Clerk User ID header is required' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM User WHERE clerk_user_id = ?',
      [clerkUserId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = devAuthMiddleware;
