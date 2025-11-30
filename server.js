// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'dev_secret_replace_in_prod';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'borrower',
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_email TEXT,
    lender TEXT,
    amount REAL,
    term INTEGER,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Missing token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role='borrower', name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(INSERT INTO users (email, password, role, name) VALUES (?,?,?,?),
      [email, hash, role, name || email.split('@')[0]],
      function(err) {
        if (err) return res.status(400).json({ message: 'User exists or DB error', error: err.message });
        const user = { id: this.lastID, email, role, name: name || email.split('@')[0] };
        const token = makeToken(user);
        res.json({ token, user });
      });
  } catch(e) { res.status(500).json({ message: 'Server error' }); }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(SELECT id,email,password,role,name FROM users WHERE email = ?, [email], async (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!row) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const user = { id: row.id, email: row.email, role: row.role, name: row.name };
    const token = makeToken(user);
    res.json({ token, user });
  });
});

// Me
app.get('/api/users/me', auth, (req, res) => {
  db.get(SELECT id,email,role,name,created_at FROM users WHERE id = ?, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ user: row });
  });
});

// Apps
app.get('/api/applications', auth, (req, res) => {
  if (req.user.role === 'lender' || req.user.role === 'admin') {
    db.all(SELECT * FROM applications ORDER BY created_at DESC, [], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ applications: rows });
    });
  } else {
    db.all(SELECT * FROM applications WHERE applicant_email = ? ORDER BY created_at DESC, [req.user.email], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ applications: rows });
    });
  }
});

app.post('/api/applications', auth, (req, res) => {
  const { lender, amount, term } = req.body;
  if (!amount || !lender) return res.status(400).json({ message: 'amount and lender required' });
  db.run(INSERT INTO applications (applicant_email, lender, amount, term) VALUES (?,?,?,?),
    [req.user.email, lender, amount, term || 12],
    function(err) {
      if (err) return res.status(500).json({ message: err.message });
      db.get(SELECT * FROM applications WHERE id = ?, [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ message: err2.message });
        res.status(201).json({ application: row });
      });
    });
});

app.patch('/api/applications/:id/approve', auth, (req, res) => {
  if (req.user.role !== 'lender' && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
  const id = req.params.id;
  db.run(UPDATE applications SET status = 'approved' WHERE id = ?, [id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Application approved' });
  });
});

app.patch('/api/applications/:id/reject', auth, (req, res) => {
  if (req.user.role !== 'lender' && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
  const id = req.params.id;
  db.run(UPDATE applications SET status = 'rejected' WHERE id = ?, [id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Application rejected' });
  });
});

app.listen(PORT, () => console.log(Backend listening on http://localhost:${PORT}));