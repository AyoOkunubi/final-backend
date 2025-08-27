const express = require('express');
const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../services/cosmosService');
const { signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role required' });
    if (!['creator','consumer'].includes(role)) return res.status(400).json({ error: 'role must be creator or consumer' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      email,
      passwordHash: hash,
      roles: [role],
      createdAt: new Date().toISOString()
    };
    await createUser(user);
    res.status(201).json({ success: true, message: 'User created' });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ sub: user.id, email: user.email, roles: user.roles });
    res.json({ token, user: { id: user.id, email: user.email, roles: user.roles } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
