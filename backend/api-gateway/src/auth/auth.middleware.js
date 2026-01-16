const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(`[AUTH] ${req.method} ${req.path} - Header: ${authHeader ? 'present' : 'missing'}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[AUTH] Missing or invalid Bearer token for ${req.path}`);
    return res.status(401).json({
      success: false,
      message: 'Missing token'
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'test-secret';

  // For development: skip verification
  if (process.env.NODE_ENV === 'development') {
    req.user = { userId: '550e8400-e29b-41d4-a716-446655440000' };
    console.log(`[AUTH] ✓ Development mode: Auth bypassed for ${req.path}`);
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    console.log('✓ Auth successful for user:', decoded.userId);
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
