const express = require('express');
const path = require('path');

const logger = require('../logger');
const CharactersService = require('./characters-services');

const charactersRouter = express.Router();

const bodyParser = express.json; // for POST & PATCH body parsing

charactersRouter.route('/').get((req, res, next) => {
  CharactersService.getAllCharacters(req.app.get('db'))
    .then((characters) => {
      res.json(CharactersService.serializeCharacters(characters));
    })
    .catch(next);
});

charactersRouter
  .route('/:character_id')
  .all(checkCharacterExists)
  .get((req, res) => {
    res.json(CharactersService.serializeCharacter(res.char));
  });

charactersRouter
  .route('/:character_id/items/')
  .all(checkCharacterExists)
  .get((req, res, next) => {
    CharactersService.getItemsForCharacter(
      req.app.get('db'),
      req.params.character_id
    )
      .then((items) => {
        res.json(CharactersService.serializeCharacterItems(items));
      })
      .catch(next);
  });

async function checkCharacterExists(req, res, next) {
  try {
    const char = await CharactersService.getById(
      req.app.get('db'),
      req.params.character_id
    );

    if (!char)
      return res.status(404).json({
        error: 'Character does not exist',
      });

    res.char = char;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = charactersRouter;
