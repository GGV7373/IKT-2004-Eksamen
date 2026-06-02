const express = require('express');
const { query, pool } = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = [
      { key: 'musikere', label: 'Musikere', image: '/media/musikk.jpg', desc: 'Livemusikk til bryllupet' },
      { key: 'blomster', label: 'Blomster', image: '/media/blomsert1.jpg', desc: 'Vakre blomsterarrangementer' },
      { key: 'kake', label: 'Kake', image: '/media/kake1.jpg', desc: 'Bryllupskakerr til enhver smak' },
      { key: 'bordkort', label: 'Bordkort', image: '/media/bordkort.jpg', desc: 'Elegante bordkort og dekor' },
    ];
    res.render('home', { title: 'Bryllup-easy AS', categories });
  } catch (err) {
    next(err);
  }
});

router.get('/products', async (req, res, next) => {
  const category = req.query.category;
  const validCategories = ['musikere', 'blomster', 'kake', 'bordkort'];
  try {
    let result;
    if (category && validCategories.includes(category)) {
      result = await query('SELECT * FROM products WHERE category = $1 ORDER BY name', [category]);
    } else {
      result = await query('SELECT * FROM products ORDER BY category, name');
    }
    const categoryLabels = { musikere: 'Musikere', blomster: 'Blomster', kake: 'Kake', bordkort: 'Bordkort' };
    res.render('products', {
      title: category ? categoryLabels[category] : 'Alle produkter',
      products: result.rows,
      category: category || null,
      categoryLabels,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.redirect('/products');
    res.render('product', { title: result.rows[0].name, product: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/cart/add', requireLogin, async (req, res, next) => {
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity) || 1;
  try {
    const result = await query('SELECT id, name, price, stock FROM products WHERE id = $1', [productId]);
    if (result.rows.length === 0) return res.redirect('/products');
    const product = result.rows[0];
    if (!req.session.cart) req.session.cart = { items: [] };
    const existing = req.session.cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      req.session.cart.items.push({
        productId,
        name: product.name,
        price: parseFloat(product.price),
        quantity,
      });
    }
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
});

router.post('/cart/remove', requireLogin, (req, res) => {
  const productId = parseInt(req.body.productId);
  if (req.session.cart) {
    req.session.cart.items = req.session.cart.items.filter((i) => i.productId !== productId);
  }
  res.redirect('/cart');
});

router.get('/cart', requireLogin, (req, res) => {
  const items = req.session.cart ? req.session.cart.items : [];
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render('cart', { title: 'Handlekurv', items, total });
});

router.get('/checkout', requireLogin, (req, res) => {
  const items = req.session.cart ? req.session.cart.items : [];
  if (items.length === 0) return res.redirect('/cart');
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render('checkout', { title: 'Bestilling', items, total });
});

router.post('/checkout', requireLogin, async (req, res, next) => {
  const cartItems = req.session.cart ? req.session.cart.items : [];
  if (cartItems.length === 0) return res.redirect('/cart');

  const client = await pool.connect();
  try {
    const productIds = cartItems.map((i) => i.productId);
    const pricesResult = await client.query(
      'SELECT id, price, stock FROM products WHERE id = ANY($1)',
      [productIds]
    );
    const priceMap = {};
    pricesResult.rows.forEach((p) => { priceMap[p.id] = { price: parseFloat(p.price), stock: p.stock }; });

    for (const item of cartItems) {
      const info = priceMap[item.productId];
      if (!info || info.stock < item.quantity) {
        return res.render('error', { title: 'Ikke nok på lager', message: `"${item.name}" er ikke tilgjengelig i ønsket antall.` });
      }
    }

    const total = cartItems.reduce((sum, i) => sum + priceMap[i.productId].price * i.quantity, 0);

    await client.query('BEGIN');
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, status, total_price) VALUES ($1, $2, $3) RETURNING id',
      [req.session.userId, 'pending', total.toFixed(2)]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of cartItems) {
      const unitPrice = priceMap[item.productId].price;
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
        [orderId, item.productId, item.quantity, unitPrice]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }
    await client.query('COMMIT');
    req.session.cart = null;
    res.redirect('/orders?success=1');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.get('/orders', requireLogin, async (req, res, next) => {
  try {
    const ordersResult = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    const orders = ordersResult.rows;
    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.quantity, oi.unit_price, p.name
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }
    const success = req.query.success === '1';
    res.render('orders', { title: 'Mine bestillinger', orders, success });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
