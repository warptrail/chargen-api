const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Characters Endpoints', function () {
  // Initialize test database
  let db;

  const {
    testUsers,
    testCharacters,
    testItems,
  } = helpers.makeCharactersFixtures();

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

  describe('GET /api/characters', () => {
    context('Given no characters', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app).get('/api/characters').expect(200, []);
      });
    });

    context('Given there are characters in the database', () => {
      beforeEach('insert characters', () => {
        helpers.seedCharactersTable(db, testUsers, testCharacters, testItems);
      });

      it('GET /characters responds with 200 and all of the characters', () => {
        const expectedCharacters = testCharacters.map((character) =>
          helpers.makeExpectedCharacter(testUsers, character, testItems)
        );
        return supertest(app)
          .get('/api/characters')
          .expect(200, expectedCharacters);
      });
    });

    context('Given an XSS attack thing', () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousCharacter,
        expectedCharacter,
      } = helpers.makeMaliciousCharacter(testUser);

      beforeEach('insert malicious character', () => {
        return helpers.seedMaliciousCharacter(db, testUser, maliciousCharacter);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/characters')
          .expect(200)
          .expect((res) => {
            expect(res.body[0].char_name).to.eql(expectedCharacter.char_name);
            expect(res.body[0].title).to.eql(expectedCharacter.title);
          });
      });
    });
  });
});
