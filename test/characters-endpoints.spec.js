const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Characters Endpoints', function () {
  // Initialize test database
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => helpers.cleanTables(db));
  afterEach('clean the table', () => helpers.cleanTables(db));

  context('Given there are characters in the database', () => {
    const testCharacters = helpers.makeCharactersArray();
    beforeEach('insert characters', () => {
      return db.into('characters').insert(testCharacters);
    });

    it('GET /characters responds with 200 and all of the characters', () => {
      return supertest(app).get('/characters').expect(200);
    });
  });
});
