const express = require('express');
const AuthService = require('./auth-service');
const logger = require('../logger');
const { requireAuth } = require('../middleware/jwt-auth');

const authRouter = express.Router();
const jsonBodyParser = express.json();

// Endpoint for logging in as existing user
authRouter.post('/login', jsonBodyParser, (req, res, next) => {
  const { user_name, password } = req.body;
  const loginUser = { user_name, password };

  // validate the loginUser has correct keys
  for (const [key, value] of Object.entries(loginUser))
    if (!value) {
      logger.error(`Missing '${key}' in request body`);
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });
    }

  // Query the database for the loginUser user_name
  AuthService.getUserWithUserName(req.app.get('db'), loginUser.user_name)
    .then((dbUser) => {
      // Validate user exists
      if (!dbUser) {
        logger.error('Username does not exist');
        return res.status(400).json({
          error: 'Incorrect user_name or password',
        });
      }

      // Compare the passwords between input and database
      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then((compareMatch) => {
        // If no match, do not log in.
        if (!compareMatch) {
          logger.error('Passwords do not match');
          return res.status(400).json({
            error: 'Incorrect user_name or password',
          });
        }

        // Build the JWT after validation passes
        const sub = dbUser.user_name;
        const payload = { user_id: dbUser.id };
        logger.info(`${sub} has logged in`);
        res.send({
          authToken: AuthService.createJwt(sub, payload),
        });
      });
    })
    .catch(next);
});

// Endpoint for refreshing JWT when it expires
authRouter.post('/refresh', requireAuth, (req, res) => {
  const sub = req.user.user_name;
  const payload = { user_id: req.user.id };
  logger.info('auth refresh occurred');
  res.send({
    authToken: AuthService.createJwt(sub, payload),
  });
});

module.exports = authRouter;
