import express from 'express';
import Boom from '@hapi/boom';
import morgan from 'morgan'
import persistence from './persistence/index.js'

const PORT = 3000

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
  res.set('X-Database-Used', process.env.MYSQL_URL ? 'MySQL' : 'SQLite');
  next();
});

app.get('/', (_, res) => {
  res.send('It works, good job! You should try <code>/animals</code> or <code>/animals/:id</code>.');
});

app.get('/animals', asyncMiddleware(async (_, res) => {
  const animals = await persistence.getAnimals();
  res.json(animals);
}));

app.get('/animals/:id', asyncMiddleware(async (req, res) => {
  const animal = await persistence.getAnimal(Number(req.params.id));
  res.json(animal);
}));

app.use((err, _, res, next) => {
  res.status(Boom.isBoom(err) ? err.output.statusCode : 500)
    .json({
      error: err.message,
    });
  next();
})

persistence
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

