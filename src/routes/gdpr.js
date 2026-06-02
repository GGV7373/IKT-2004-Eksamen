'use strict';

const express = require('express');
const { query } = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/personvern', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Personvernerklæring – Bryllup-easy AS</title>
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .privacy-page { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    .privacy-page h1 { margin-bottom: 0.5rem; }
    .privacy-page h2 { margin-top: 2rem; }
    .privacy-page p, .privacy-page li { line-height: 1.7; }
    .privacy-page ul { padding-left: 1.5rem; }
  </style>
</head>
<body>
  <main class="privacy-page">
    <h1>Personvernerklæring</h1>
    <p><em>Sist oppdatert: ${new Date().toLocaleDateString('no-NO')}</em></p>

    <h2>1. Behandlingsansvarlig</h2>
    <p>Bryllup-easy AS er behandlingsansvarlig for personopplysningene vi samler inn og behandler.</p>

    <h2>2. Hvilke opplysninger vi samler inn</h2>
    <ul>
      <li>Fullt navn og e-postadresse ved registrering</li>
      <li>Hashet passord (aldri lagret i klartekst)</li>
      <li>Bestillingshistorikk og kjøpte produkter</li>
      <li>Tidspunkt for samtykke til personvernerklæringen</li>
    </ul>

    <h2>3. Formål og rettslig grunnlag</h2>
    <p>Vi behandler opplysningene for å:</p>
    <ul>
      <li>Opprette og administrere brukerkonto (kontraktoppfyllelse, GDPR art. 6 b)</li>
      <li>Behandle og levere bestillinger (kontraktoppfyllelse, GDPR art. 6 b)</li>
      <li>Overholde regnskapsplikten (rettslig forpliktelse, GDPR art. 6 c)</li>
    </ul>

    <h2>4. Dine rettigheter</h2>
    <p>Etter GDPR har du rett til å:</p>
    <ul>
      <li><strong>Innsyn</strong> – laste ned alle dine personopplysninger via <a href="/user/data">Mine data (JSON)</a></li>
      <li><strong>Sletting</strong> – slette kontoen din permanent via <a href="/account">Min konto</a></li>
      <li><strong>Portabilitet</strong> – eksportere dataene dine i maskinlesbart format</li>
      <li><strong>Klage</strong> – klage til Datatilsynet dersom du mener behandlingen er ulovlig</li>
    </ul>

    <h2>5. Lagring og sikkerhet</h2>
    <p>Opplysningene lagres i en sikret PostgreSQL-database. Passord hashes med bcrypt (12 runder).
    Vi deler ikke opplysningene dine med tredjeparter.</p>

    <h2>6. Sletting av data</h2>
    <p>Du kan når som helst slette kontoen din. Ved sletting fjernes alle personopplysninger
    knyttet til deg permanent fra databasen vår.</p>

    <h2>7. Kontakt</h2>
    <p>Spørsmål om personvern kan rettes til oss per e-post.</p>

    <p><a href="/">&larr; Tilbake til forsiden</a></p>
  </main>
</body>
</html>`);
});

router.get('/user/data', requireLogin, async (req, res, next) => {
  try {
    const userResult = await query(
      `SELECT id, email, full_name, created_at, gdpr_consent, gdpr_consent_at
       FROM users WHERE id = $1`,
      [req.session.userId]
    );
    const ordersResult = await query(
      `SELECT o.id, o.status, o.total_price, o.created_at,
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'quantity',   oi.quantity,
                'unit_price', oi.unit_price
              )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.session.userId]
    );
    res.json({
      user: userResult.rows[0] || null,
      orders: ordersResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/user/delete', requireLogin, async (req, res, next) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.session.userId]);
    req.session.destroy(() => res.redirect('/'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
