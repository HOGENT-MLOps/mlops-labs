import { MongoClient } from 'mongodb';
import generateFakeData from './generateFakeData.js';

let client;

export async function initialize() {
  client = new MongoClient(process.env.MONGO_URL, { authSource: 'admin', });
  await client.connect();

  const animals = client.db().collection('animals');

  const count = await animals.countDocuments();
  if (count === 0) {
    await animals.createIndex({ id: 1 }, { unique: true });
    await animals.insertMany(generateFakeData());
  }

  console.log('Database initialized');
}

export async function close() {
  await client.close();
  client = null;
}

export async function getAnimals() {
  const animals = await client.db().collection('animals').find().toArray() || [];
  return animals.map(({ id, name }) => ({ id, name }));
}

export async function getAnimal(id) {
  const animal = await client.db().collection('animals').findOne({ id: id });
  if (!animal) {
    throw new Error('Animal not found');
  }
  return {
    id: animal.id,
    name: animal.name,
  };
}
