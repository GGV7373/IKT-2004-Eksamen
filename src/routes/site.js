const express = require('express');
const db = require('../db');

const router = express.Router();

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHomePage(names, message = '') {
  const nameItems = names.length > 0
    ? names.map((entry) => `<li>${escapeHtml(entry.name)}</li>`).join('')
    : '<li>Ingen navn lagt til enda.</li>';

  const messageMarkup = message ? `<p id="melding">${escapeHtml(message)}</p>` : '<p id="melding"></p>';

  return `<!DOCTYPE html>
<html lang="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Liten SSR-nettside</title>
  </head>
  <body>
    <h1>Liten nettside med Express</h1>
    <p>Denne siden viser navn fra PostgreSQL.</p>
    <p>Databasen kan testes på <a href="/database-status">/database-status</a>.</p>

    <form action="/names" method="post">
      <label for="name">Skriv inn et navn</label>
      <input id="name" name="name" type="text" required />
      <button type="submit">Send inn</button>
    </form>

    ${messageMarkup}

    <h2>Navneliste</h2>
    <ul id="name-list">${nameItems}</ul>

    <script src="/js/main.js"></script>
  </body>
</html>`;
}

router.get('/database-status', async (req, res, next) => {
  try {
    const result = await db.query('SELECT NOW() AS server_time, current_database() AS database_name');
    res.json({
      connected: true,
      database: result.rows[0].database_name,
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name FROM names ORDER BY id DESC');
    const message = typeof req.query.message === 'string' ? req.query.message : '';
    res.send(renderHomePage(result.rows, message));
  } catch (error) {
    next(error);
  }
});

router.post('/names', async (req, res, next) => {
  const submittedName = typeof req.body.name === 'string' ? req.body.name.trim() : '';

  if (!submittedName) {
    res.redirect('/?message=Du+maa+skrive+inn+et+navn.');
    return;
  }

  try {
    await db.query('INSERT INTO names (name) VALUES ($1)', [submittedName]);
    res.redirect(`/?message=${encodeURIComponent(`La til navnet: ${submittedName}`)}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

