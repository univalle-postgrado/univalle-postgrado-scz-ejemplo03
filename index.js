const express = require('express');
const app = express();
const { body, validationResult } = require('express-validator');
const { Client } = require('pg');
const port = 3000;

app.use(express.json());

const db = new Client({
  user: 'univalle',
  host: 'localhost',
  database: 'univalle_dbmovies',
  password: '123456',
  port: 5432
});
db.connect();

const validateMovie = [
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .custom(async (value, { req }) => {
      let id = req.params.id;
      if (!id) id = 0;
      const { rows } = await db.query(
        'SELECT COUNT(id) AS exists_movie FROM movies WHERE title = $1 AND id != $2',
        [value, id]
      );
      if (rows[0]['exists_movie'] > 0) {
        throw new Error('El título ya existe para otra película');
      }
      return true;
    }),
  body('year')
    .notEmpty()
    .withMessage('El año es requerido')
    .isInt({ min: 1950, max: 2025 })
    .withMessage('El año debe ser un número entre 1950 y 2025')
];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/movies', async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      code: 1001,
      message: 'Error al obtener películas',
      error_message: err.message
    });
  }
});

app.post('/movies', validateMovie, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const { rows } = await db.query('INSERT INTO movies (title, year) VALUES ($1, $2) RETURNING *', [req.body.title, req.body.year]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({
      code: 1002,
      message: 'Error al registrar película',
      error_message: err.message
    });
  }
});

app.get('/movies/:id', async (req, res) => {
  try {
    const { rows, rowCount } = await db.query("SELECT * FROM movies WHERE id=" + req.params.id);
    if (rowCount > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Película no encontrada' });
    }
  } catch (err) {
    res.status(500).json({
      code: 1003,
      message: 'Error al obtener película',
      error_message: err.message
    });
  }
});

app.put('/movies/:id', validateMovie, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const id = parseInt(req.params.id);
    const { title, year } = req.body;
    const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
    if (rowCount > 0) {
      const { rows } = await db.query(`UPDATE movies SET title = '${title}', year = '${year}' WHERE id = '${id}' RETURNING *`);
      res.json(rows[0]);
    } else {
      const { rows } = await db.query('INSERT INTO movies (id, title, year) VALUES ($1, $2, $3) RETURNING *', [id, title, year]);
      res.status(201).json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({
      code: 1004,
      message: 'Error al modificar la película',
      error_message: err.message
    });
  }
});

app.patch('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const movieIndex = movies.findIndex(m => m.id === id);
  if (movieIndex !== -1) {
    Object.assign(movies[movieIndex], req.body);
    res.json(movies[movieIndex]);
  } else {
    res.status(404).json({ message: "Película no encontrada" });
  }
});
app.delete('/movies/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { rowCount } = await db.query(`SELECT * FROM movies WHERE id=${id}`);
  if (rowCount > 0) {
    const { rows } = await db.query(
      `DELETE FROM movies WHERE id=${id}`);
    res.sendStatus(204);
  } else {
    res.status(404).json({ message: "Película no encontrada" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
