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
        return helpers.seedCharactersTable(
          db,
          testUsers,
          testCharacters,
          testItems
        );
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

      beforeEach('insert malicious thing', () => {
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

  describe('GET /api/characters/:character_id', () => {
    context('Given no characters', () => {
      it('responds with 404', () => {
        const characterId = 999999;
        return supertest(app)
          .get(`/api/characters/${characterId}`)
          .expect(404, { error: 'Character does not exist' });
      });
    });

    context('Given there are characters in the database', () => {
      beforeEach('insert characters', () =>
        helpers.seedCharactersTable(db, testUsers, testCharacters, testItems)
      );

      it('responds with 200 and the specified character', () => {
        const characterId = 2;
        const expectedCharacter = helpers.makeExpectedCharacter(
          testUsers,
          testCharacters[characterId - 1],
          testItems
        );

        return supertest(app)
          .get(`/api/characters/${characterId}`)
          .expect(200, expectedCharacter);
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
          .get(`/api/characters/${maliciousCharacter.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.char_name).to.eql(expectedCharacter.char_name);
            expect(res.body.title).to.eql(expectedCharacter.title);
          });
      });
    });
  });

  describe('GET /api/characters/:character_id/items', () => {
    context('Given no characters', () => {
      beforeEach(() => helpers.seedUsersTable(db, testUsers));
      it('responds with 404', () => {
        const characterId = 999999;
        return supertest(app)
          .get(`/api/characters/${characterId}/items`)
          .expect(404, { error: 'Character does not exist' });
      });
    });

    context(
      'Given there are items for specific character in the database',
      () => {
        beforeEach('insert characters', () =>
          helpers.seedCharactersTable(db, testUsers, testCharacters, testItems)
        );

        it('responds with 200 and the specified items', () => {
          const characterId = 1;
          const expectedItems = helpers.makeExpectedCharacterItems(
            testUsers,
            characterId,
            testItems
          );

          return supertest(app)
            .get(`/api/characters/${characterId}/items`)
            .expect(200, expectedItems);
        });
      }
    );
  });

  describe('POST /api/characters', () => {
    beforeEach('insert users', () => helpers.seedUsersTable(db, testUsers));

    it('creates a new character, responding with 201 and the new character', () => {
      const testUser = testUsers[0];
      const newCharacter = helpers.postNewCharacter(testUser.id);

      return supertest(app)
        .post('/api/characters')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .send(newCharacter)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property('id');
          expect(res.body.char_name).to.eql(newCharacter.char_name);
          expect(res.body.title).to.eql(newCharacter.title);
          expect(res.body.char_class).to.eql(newCharacter.char_class);
          expect(res.body.race).to.eql(newCharacter.race);
          expect(res.body.background).to.eql(newCharacter.background);
          expect(res.body.alignment).to.eql(newCharacter.alignment);
          expect(parseFloat(res.body.char_level)).to.eql(
            newCharacter.char_level
          );
          expect(parseFloat(res.body.strength)).to.eql(newCharacter.strength);
          expect(parseFloat(res.body.dexterity)).to.eql(newCharacter.dexterity);
          expect(parseFloat(res.body.constitution)).to.eql(
            newCharacter.constitution
          );
          expect(parseFloat(res.body.intelligence)).to.eql(
            newCharacter.intelligence
          );
          expect(parseFloat(res.body.wisdom)).to.eql(newCharacter.wisdom);
          expect(parseFloat(res.body.charisma)).to.eql(newCharacter.charisma);
        })
        .expect((res) =>
          db
            .from('characters')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.char_name).to.eql(newCharacter.char_name);
              expect(row.title).to.eql(newCharacter.title);
              expect(row.char_class).to.eql(newCharacter.char_class);
              expect(row.race).to.eql(newCharacter.race);
              expect(row.background).to.eql(newCharacter.background);
              expect(row.alignment).to.eql(newCharacter.alignment);
              expect(row.char_level).to.eql(newCharacter.char_level);
              expect(row.strength).to.eql(newCharacter.strength);
              expect(row.dexterity).to.eql(newCharacter.dexterity);
              expect(row.constitution).to.eql(newCharacter.constitution);
              expect(row.intelligence).to.eql(newCharacter.intelligence);
              expect(row.wisdom).to.eql(newCharacter.wisdom);
              expect(row.charisma).to.eql(newCharacter.charisma);
            })
        );
    });
  });
});
