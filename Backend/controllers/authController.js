const User = require('../Model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email & password required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'email exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash });
  await user.save();
  res.json({ message: 'registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'invalid credentials' });
  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  res.json({ token });
};
