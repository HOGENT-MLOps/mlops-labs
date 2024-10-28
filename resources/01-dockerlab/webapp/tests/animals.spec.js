import fetch from 'node-fetch';
import { expect } from 'chai';

const URL = `${process.env.API_URL || 'http://localhost:3000'}/animals`;

describe('Animals', () => {
  it('should 200 and return all animals', async () => {
    const response = await fetch(URL);

    expect(response.status).to.equal(200);

    const animals = await response.json();
    expect(animals).to.be.an('array').of.length(10);
  });

  it('should 200 and return a single animal', async () => {
    const response = await fetch(`${URL}/1`);

    expect(response.status).to.equal(200);

    const animal = await response.json();
    expect(animal).to.be.an('object').with.keys('id', 'name');
    expect(animal.id).to.be.a('number').and.to.equal(1);
    expect(animal.name).to.be.a('string');
  });

  it('should 404 and return an error when the animal is not found', async () => {
    const response = await fetch(`${URL}/123`);

    expect(response.status).to.equal(404);

    const error = await response.json();
    expect(error).to.be.an('object').with.keys('error');
    expect(error).to.include({
      error: 'Animal not found',
    });
  });
})