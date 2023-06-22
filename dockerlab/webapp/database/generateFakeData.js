import animal from "@fakerjs/animal";

/**
 * Generates fake data for the animals collection, including a
 * name and a unique id.
 *
 * @param {Number} nrOfAnimals - Number of animals to generate
 */
export default (nrOfAnimals = 10) => {
  const animals = [];
  for (let i = 1; i <= nrOfAnimals; i++) {
    animals.push({
      id: i,
      name: animal({
        type: 'pet',
        locale: 'en_US',
      }),
    });
  }
  return animals;
};
