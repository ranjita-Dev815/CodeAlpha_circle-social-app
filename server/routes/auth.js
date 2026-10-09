const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = (u) => ({
  _id: u._id, username: u.username, email: u.email,
  name: u.name, bio: u.bio, avatar: u.avatar, isPrivate: u.isPrivate,
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(400).json({ message: 'Username or email already in use' });
    const user = await User.create({ username, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: safe(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(400).json({ message: 'Wrong email or password' });
    res.json({ token: sign(user), user: safe(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(safe(user));
});

module.exports = router;
