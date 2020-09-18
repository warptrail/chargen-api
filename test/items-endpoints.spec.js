/* eslint-disable no-undef */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Items Endpoints', function () {
  let db;

  const { testCharacters, testUsers } = helpers.makeCharactersFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/items', () => {
    beforeEach('insert characters', () =>
      helpers.seedCharactersTable(db, testUsers, testCharacters)
    );

    it('creates an item, responding with 201 and the new item', function () {
      const testCharacter = testCharacters[0];
      const testUser = testUsers[0];
      const newItem = {
        item_name: 'Test new item',
        item_type: 'Test new item',
        item_description: 'Test new item',
        item_abilities: 'Test new item',
        character_id: testCharacter.id,
      };

      return supertest(app)
        .post('/api/items')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .send(newItem)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property('id');
          expect(res.body.item_name).to.eql(newItem.item_name);
          expect(res.body.item_type).to.eql(newItem.item_type);
          expect(res.body.character.id).to.eql(newItem.character_id);

          expect(res.headers.location).to.eql(`/api/items/${res.body.id}`);
        })
        .expect((res) =>
          db
            .from('items')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.item_name).to.eql(newItem.item_name);
              expect(row.item_type).to.eql(newItem.item_type);
              expect(row.item_description).to.eql(newItem.item_description);
              expect(row.item_abilities).to.eql(newItem.item_abilities);
              expect(row.character_id).to.eql(newItem.character_id);
              expect(row.user_id).to.eql(testUser.id);
            })
        );
    });
  });
});
