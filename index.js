const express = require('express');
const app = express();
const { body, validationResult } = require('express-validator');
const port = 3000;

app.use(express.json());

var movies = [
    { id: 1, title: 'El Padrino', year: 1980 },
    { id: 2, title: 'El Señor de los anillos', year: 2002 }
]

var lastId = 2;
function generateId() {
    lastId++;
    return lastId;
}

const validateMovie = [
    body('title').notEmpty().withMessage('El título es requerido'),
];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});
app.post('/movies', validateMovie, (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
        return res.status(400).json( { error: errors.array() } );
    }

    const newMovie = {
        // ...req.body,
        id: generateId(),
        title: req.body.title,
        year: req.body.year
    }
    movies.push(newMovie);
    res.status(201).json(newMovie);
});
app.get('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex !== -1) {
        res.json(movies[movieIndex]);
    } else {
        res.status(404).json({ message: "Película no encontrada" });
    }
});
app.put('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex !== -1) {
        movies[movieIndex] = { ...req.body, id };
        res.json(movies[movieIndex]);
    } else {
        const newMovie = {
            id,
            ...req.body
        }
        movies.push(newMovie);
        res.status(201).json(newMovie);
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
app.delete('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex !== -1) {
        movies.splice(movieIndex, 1);
        res.sendStatus(204);
    } else {
        res.status(404).json({ message: "Película no encontrada" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
