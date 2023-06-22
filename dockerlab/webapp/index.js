const express = require('express');
const morgan = require('morgan');
const database = require('./database');

const PORT = 3000;

function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
}

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use((_, res, next) => {
  res.set('X-Database-Used', process.env.MONGO_URL ? 'MongoDB' : 'SQLite');
  next();
});

app.get('/animals', asyncMiddleware(async (_, res) => {
  const animals = await database.getAnimals();
  res.json(animals);
}));

app.get('/animals/:id', asyncMiddleware(async (req, res) => {
  const animal = await database.getAnimal(Number(req.params.id));
  res.json(animal);
}));

app.use((err, _, res, __) => {
  console.error(err);

  res.status(500)
    .send({
      error: err.message,
    });
})

database
  .initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database failed to connect, check the error below');
    console.error(err);
    process.exit(1);
  });

