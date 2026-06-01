const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Liten SSR-nettside</title>
  </head>
  <body>
    <h1>Liten nettside med Express</h1>
    <p>Denne siden er rendret fra serveren.</p>
    <button id="hei-knapp" type="button">Trykk her</button>
    <p id="melding"></p>

    <script src="/js/main.js"></script>
  </body>
</html>`);
});

module.exports = router;

