const sqlite3 = require('sqlite3')
const { open } = require('sqlite');
const data = require('./data.json');

let db;

async function initialize() {
  db = await open({
    filename: './database/database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec('CREATE TABLE IF NOT EXISTS animal(id INTEGER PRIMARY KEY, name TEXT)');

  const count = await db.get('SELECT COUNT(*) AS count FROM animal');

  if (count.count === 0) {
    await db.exec(`INSERT INTO animal(name) VALUES${data.map((animal) => `('${animal.name}')`).join(',')}`);
  }

  console.log('Database initialized');
}

async function getAnimals() {
  return await db.all('SELECT * FROM animal');
}

async function getAnimal(id) {
  const animal = await db.get('SELECT * FROM animal WHERE id = ?', [id]);
  if (!animal) {
    throw new Error('Animal not found');
  }
  return animal;
}

module.exports = {
  initialize,
  getAnimals,
  getAnimal,
};
