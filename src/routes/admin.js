const express = require('express');
const path = require('path');
const multer = require('multer');
const { query } = require('../db');
const { requireAdmin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Admin innlogging', error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: 'Admin innlogging', error: 'Feil brukernavn eller passord.' });
});

router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const [users, products, orders] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM products'),
      query('SELECT COUNT(*) FROM orders'),
    ]);
    res.render('admin/dashboard', {
      title: 'Admin — Dashboard',
      userCount: users.rows[0].count,
      productCount: products.rows[0].count,
      orderCount: orders.rows[0].count,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC');
    res.render('admin/users', { title: 'Admin — Brukere', users: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY category, name');
    res.render('admin/products', { title: 'Admin — Produkter', products: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/products/new', requireAdmin, (req, res) => {
  res.render('admin/product-form', {
    title: 'Admin — Nytt produkt',
    product: null,
    action: '/admin/products/new',
    error: null,
  });
});

router.post('/products/new', requireAdmin, upload.single('image'), async (req, res, next) => {
  const { name, category, description, price, stock } = req.body;
  const image_path = req.file ? '/uploads/' + req.file.filename : null;
  try {
    await query(
      'INSERT INTO products (name, category, description, price, stock, image_path) VALUES ($1,$2,$3,$4,$5,$6)',
      [name, category, description, price, stock || 0, image_path]
    );
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/edit', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.redirect('/admin/products');
    res.render('admin/product-form', {
      title: 'Admin — Rediger produkt',
      product: result.rows[0],
      action: `/admin/products/${req.params.id}/edit`,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/edit', requireAdmin, upload.single('image'), async (req, res, next) => {
  const { name, category, description, price, stock } = req.body;
  try {
    if (req.file) {
      await query(
        'UPDATE products SET name=$1, category=$2, description=$3, price=$4, stock=$5, image_path=$6 WHERE id=$7',
        [name, category, description, price, stock || 0, '/uploads/' + req.file.filename, req.params.id]
      );
    } else {
      await query(
        'UPDATE products SET name=$1, category=$2, description=$3, price=$4, stock=$5 WHERE id=$6',
        [name, category, description, price, stock || 0, req.params.id]
      );
    }
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
});

router.get('/orders', requireAdmin, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT o.id, o.status, o.total_price, o.created_at,
             u.full_name, u.email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);
    res.render('admin/orders', { title: 'Admin — Bestillinger', orders: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
