const express = require('express');
const path = require('path');
const session = require('express-session');

const authRouter = require('./routes/auth');
const shopRouter = require('./routes/shop');
const adminRouter = require('./routes/admin');
const gdprRouter = require('./routes/gdpr');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  res.locals.cartCount = req.session.cart ? req.session.cart.items.length : 0;
  next();
});

app.use('/media', express.static(path.join(__dirname, '..', 'media')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));

app.use('/', authRouter);
app.use('/', shopRouter);
app.use('/', gdprRouter);
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render('error', { title: 'Side ikke funnet', message: 'Siden du leter etter finnes ikke.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Serverfeil', message: err.message || 'Noe gikk galt.' });
});

module.exports = app;
