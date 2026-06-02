const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { title: 'Registrer deg', error: null });
});

router.post('/register', async (req, res, next) => {
  const { full_name, email, password, gdpr_consent } = req.body;
  if (!full_name || !email || !password) {
    return res.render('register', { title: 'Registrer deg', error: 'Alle felt må fylles ut.' });
  }
  if (!gdpr_consent) {
    return res.render('register', { title: 'Registrer deg', error: 'Du må godta personvernerklæringen for å registrere deg.' });
  }
  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.render('register', { title: 'Registrer deg', error: 'Denne e-postadressen er allerede i bruk.' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    await query(
      'INSERT INTO users (email, password_hash, full_name, gdpr_consent, gdpr_consent_at) VALUES ($1, $2, $3, true, NOW())',
      [email, password_hash, full_name]
    );
    res.redirect('/login?msg=registered');
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  const msg = req.query.msg === 'registered' ? 'Registrering vellykket! Logg inn nå.' : null;
  res.render('login', { title: 'Logg inn', error: null, info: msg });
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.render('login', { title: 'Logg inn', error: 'Feil e-post eller passord.', info: null });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { title: 'Logg inn', error: 'Feil e-post eller passord.', info: null });
    }
    req.session.userId = user.id;
    req.session.user = { id: user.id, email: user.email, full_name: user.full_name };
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

router.post('/account/delete', requireLogin, async (req, res, next) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.session.userId]);
    req.session.destroy(() => res.redirect('/'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
