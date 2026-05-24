import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.JWT_SECRET || 'changeme_secret',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use.' });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id, user.username);

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.username);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

export default router;
