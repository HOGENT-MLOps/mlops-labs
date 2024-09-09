import knex from "knex";
import Boom from "@hapi/boom";
import generateFakeData from "./generateFakeData.js";

let knexInstance;

export async function initialize() {
  knexInstance = knex({
    client: 'mysql2',
    connection: process.env.MYSQL_URL,
  });
  await knexInstance.raw('CREATE DATABASE IF NOT EXISTS `animals`;');
  await knexInstance.raw('CREATE TABLE IF NOT EXISTS `animals` (`id` INT NOT NULL, `name` VARCHAR(255) NOT NULL, PRIMARY KEY (`id`));');

  const [animalCount] = await knexInstance('animals').count();

  if (animalCount['count(*)'] === 0) {
    await knexInstance('animals').insert(generateFakeData());
    console.log('Fake data generated');
  }

  console.log('MySQL database initialized');
}

export async function close() {
  await knexInstance.end();
  knexInstance = null;
}

export async function getAnimals() {
  return await knexInstance('animals').select();
}

export async function getAnimal(id) {
  const animal = await knexInstance('animals').where('id', id).first();
  if (!animal) {
    throw Boom.notFound('Animal not found');
  }
  return animal;
}
