const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Protected endpoints', () => {
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

  before('clean tables', () => helpers.cleanTables(db));

  after('disconnect from db', () => db.destroy());

  afterEach('clean tables', () => helpers.cleanTables(db));

  beforeEach('seed tables', () =>
    helpers.seedCharactersTable(db, testUsers, testCharacters, testItems)
  );

  const protectedEndpoints = [
    {
      name: 'POST /api/characters',
      path: '/api/characters',
      method: supertest(app).post,
    },
    // {
    //   name: 'PATCH /api/characters/:character_id',
    //   path: '/api/characters/:character_id',
    //   method: supertest(app).patch,
    // },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      it('responds 401 "Missing bearer token" when no bearer token', () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });

      it('responds 401 "Unauthorized request" when invalid JWT secret', () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';

        return endpoint
          .method(endpoint.path)
          .set(
            'authorization',
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: 'Unauthorized request' });
      });

      it('responds 401 "Unauthorized request" when invalid sub in payload', () => {
        const invalidUser = { user_name: 'not-existy', id: 1 };
        return endpoint
          .method(endpoint.path)
          .set('authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' });
      });
    });
  });
});
