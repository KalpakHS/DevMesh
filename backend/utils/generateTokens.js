const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'devmesh_fallback_jwt_secret',
    { expiresIn: '2h' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'devmesh_fallback_jwt_refresh_secret',
    { expiresIn: '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
