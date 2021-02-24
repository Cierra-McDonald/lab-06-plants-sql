const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/plants', async(req, res) => {
  try {
    const data = await client.query(`SELECT
    plants.id,
    plants.image,
    plants.genus,
    plants.sizes_id,
    plants.light,
    plants.price,
    plants.name,
    plants.owner_id
    FROM plants JOIN sizes
    ON plants.sizes_id = sizes.id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/sizes', async(req, res) => {
  try {
    const data = await client.query('SELECT * from sizes');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



app.get('/plants/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`
    SELECT
    plants.id,
    plants.image,
    plants.genus,
    plants.sizes_id,
    plants.light,
    plants.price,
    plants.name,
    plants.owner_id
    FROM plants JOIN sizes
    ON plants.sizes_id = sizes.id
    WHERE plants.id=$1`, [id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/plants', async(req, res) => { 
  try { 
    const data = await client.query(`INSERT INTO plants (image, genus, sizes_id, light, price, name, owner_id)
    values ($1, $2, $3, $4, $5, $6, $7)
    returning *
    `,
    [
      req.body.image, 
      req.body.genus, 
      req.body.sizes_id, 
      req.body.light, 
      req.body.price, 
      req.body.name,
      1
    ]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/plants/:id', async(req, res) => { 
  try {
    const id = req.params.id;
    const data = await client.query('DELETE from plants WHERE id=$1 returning *', [id]);

    res.json(data.rows[0]);
  } catch(e) { 
    res.status(500).json({ error: e.message });
  }
});

app.put('/plants/:id', async(req, res) => { 

  const id = req.params.id;

  try {
    const data = await client.query(`UPDATE plants SET 
    image = $1, 
    genus = $2, 
    sizes_id = $3,
    light = $4, 
    price = $5, 
    name = $6 
    WHERE id=$7 
    returning *;
    `,
    [
      req.body.image, 
      req.body.genus, 
      req.body.sizes_id, 
      req.body.light, 
      req.body.price, 
      req.body.name,
      id
    ]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
