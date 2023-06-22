const { MongoClient } = require('mongodb');
const data = require('./data.json');

let client;

async function initialize() {
  client = new MongoClient(process.env.MONGO_URL, { authSource: 'admin', });
  await client.connect();

  const animals = client.db().collection('animals');

  const count = await animals.countDocuments();
  if (count === 0) {
    await animals.createIndex({ id: 1 }, { unique: true });
    await animals.insertMany(data);
  }

  console.log('Database initialized');
}

async function getAnimals() {
  const animals = await client.db().collection('animals').find().toArray() || [];
  return animals.map(({ id, name }) => ({ id, name }));
}

async function getAnimal(id) {
  const animal = await client.db().collection('animals').findOne({ id: id });
  if (!animal) {
    throw new Error('Animal not found');
  }
  return {
    id: animal.id,
    name: animal.name,
  };
}

module.exports = {
  initialize,
  getAnimals,
  getAnimal,
};