const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

module.exports = {
  signup,
  login,

};
async function signup(req, res) {
  try {
    const user = new User(req.body);
    await user.save();
    const token = createJWT(user);
    res.json({ token });
  } catch (err) {
    console.log('Signup error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Handle duplicate email
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already taken!' });
    }
    
    // Generic error
    res.status(400).json({ message: 'Signup failed. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(401).json({message: 'Invalid email or password'});
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch) {
        const token = createJWT(user);
        res.json({token});
      } else {
        return res.status(401).json({message: 'Invalid email or password'});
      }
    });
  } catch (err) {
    console.log('Login error:', err);
    return res.status(401).json({message: 'Login failed. Please try again.'});
  }
}

/*----- Helper Functions -----*/

function createJWT(user) {
  return jwt.sign(
    {user}, // data payload
    SECRET,
    {expiresIn: '24h'}
  );
}