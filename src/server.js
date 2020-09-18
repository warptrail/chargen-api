const app = require('./app');

// npm dependencies
const knex = require('knex');

// import variables from config file
const { PORT, DATABASE_URL } = require('./config');

// connect to database with knex
const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

// set the app to use the database
app.set('db', db);

// Starts the Server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
