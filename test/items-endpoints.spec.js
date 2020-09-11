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

      console.log(testCharacter, newItem);
      return supertest(app)
        .post('/api/items')
        .send(newItem)
        .expect(201)
        .expect((res) => {
          console.log('resbody', res.body);
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

    // const requiredFields = ['text', 'rating', 'thing_id'];

    // requiredFields.forEach((field) => {
    //   const testThing = testThings[0];
    //   const testUser = testUsers[0];
    //   const newReview = {
    //     text: 'Test new review',
    //     rating: 3,
    //     thing_id: testThing.id,
    //   };

    //   it(`responds with 400 and an error message when the '${field}' is missing`, () => {
    //     delete newReview[field];

    //     return supertest(app)
    //       .post('/api/items')
    //       .set('authorization', helpers.makeAuthHeader(testUser))
    //       .send(newReview)
    //       .expect(400, {
    //         error: `Missing '${field}' in request body`,
    //       });
    //   });
    // });
  });
});
