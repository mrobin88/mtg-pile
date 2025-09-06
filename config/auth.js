const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

function auth(req, res, next) {
  try {
    const token = req.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;
