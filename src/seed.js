require('dotenv').config();
const { pool, initializeDatabase } = require('./db');

const products = [
  { name: 'Musikere Pakke 1', category: 'musikere', description: 'Klassisk duo med fiolin og piano — perfekt for seremoni og middag.', price: 4500.00, stock: 5, image_path: '/media/musikk.jpg' },
  { name: 'Musikere Pakke 2', category: 'musikere', description: 'Akustisk gitarist som spiller kjærlighetsballader gjennom hele kvelden.', price: 3800.00, stock: 5, image_path: '/media/musikk2.jpg' },
  { name: 'Musikere Pakke 3', category: 'musikere', description: 'Jazzband med fire musikere — livlig stemning til middagsselskapet.', price: 5200.00, stock: 5, image_path: '/media/musikk3.jpg' },
  { name: 'Musikere Pakke 4', category: 'musikere', description: 'Fullt danseband — dans og moro til langt på natt.', price: 6000.00, stock: 3, image_path: '/media/musikk4.jpg' },
  { name: 'Blomsterdekorasjon 1', category: 'blomster', description: 'Elegante hvite roser og grønt — klassisk og tidløs stil.', price: 1200.00, stock: 10, image_path: '/media/blomsert1.jpg' },
  { name: 'Blomsterdekorasjon 2', category: 'blomster', description: 'Fargerike sommerblomster — frisk og gledelig dekorasjon.', price: 950.00, stock: 10, image_path: '/media/blomser2.jpg' },
  { name: 'Blomsterdekorasjon 3', category: 'blomster', description: 'Romantiske pioner og lavendel — drømmende og duftende arrangement.', price: 1500.00, stock: 8, image_path: '/media/blomsert3.jpg' },
  { name: 'Bryllupskake 1', category: 'kake', description: 'Trelags vaniljekake med kremostfrosting og ferske bær.', price: 3500.00, stock: 5, image_path: '/media/kake1.jpg' },
  { name: 'Bryllupskake 2', category: 'kake', description: 'Elegant fondantkake med gulldetaljer og sukkerblomster.', price: 4200.00, stock: 5, image_path: '/media/kake2.jpg' },
  { name: 'Bryllupskake 3', category: 'kake', description: 'Rustikk naked cake med sesongens frukter og bær.', price: 2800.00, stock: 5, image_path: '/media/kake3.jpg' },
  { name: 'Bordkort Design 1', category: 'bordkort', description: 'Klassiske hvite kort med gulltrykk — pris per 10 stk.', price: 250.00, stock: 100, image_path: '/media/bordkort.jpg' },
  { name: 'Bordkort Design 2', category: 'bordkort', description: 'Moderne minimalistisk design med blindtrykk — pris per 10 stk.', price: 300.00, stock: 100, image_path: '/media/bordkort3.jpg' },
  { name: 'Bordkort Design 3', category: 'bordkort', description: 'Botanisk stil med blomstermotiv — pris per 10 stk.', price: 180.00, stock: 100, image_path: '/media/bordkot.jpg' },
];

async function seed() {
  await initializeDatabase();
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, category, description, price, stock, image_path)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT DO NOTHING`,
      [p.name, p.category, p.description, p.price, p.stock, p.image_path]
    );
  }
  console.log(`Seeded ${products.length} products.`);
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
