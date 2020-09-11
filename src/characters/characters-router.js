const express = require('express');
const path = require('path');

const logger = require('../logger');
const CharactersService = require('./characters-services');

const { requireAuth } = require('../middleware/jwt-auth');

const charactersRouter = express.Router();

const bodyParser = express.json(); // for POST & PATCH body parsing

charactersRouter
  .route('/')
  .get((req, res, next) => {
    CharactersService.getAllCharacters(req.app.get('db'))
      .then((characters) => {
        res.json(CharactersService.serializeCharacters(characters));
      })
      .catch(next);
  })
  .post(requireAuth, bodyParser, (req, res, next) => {
    const {
      char_name,
      title,
      char_class,
      race,
      background,
      alignment,
      char_level,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    } = req.body;
    const newCharacter = {
      char_name,
      title,
      char_class,
      race,
      background,
      alignment,
      char_level,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    };
    for (const [key, value] of Object.entries(newCharacter))
      if (value == null)
        return res.status(400).json({
          error: `Missing ${key} in request body`,
        });
    // Set the user Id in the new character
    newCharacter.user_id = req.user.id;

    CharactersService.insertCharacter(req.app.get('db'), newCharacter)
      .then((character) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${character.id}`))
          .json(CharactersService.serializeCharacter(character));
      })
      .catch(next);
  });

charactersRouter
  .route('/:character_id')
  .all(checkCharacterExists)
  .get((req, res) => {
    res.json(CharactersService.serializeCharacter(res.char));
  })
  .delete((req, res, next) => {
    CharactersService.deleteCharacter(
      req.app.get('db'),
      req.params.character_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, bodyParser, (req, res, next) => {
    const {
      char_name,
      title,
      char_class,
      race,
      background,
      alignment,
      char_level,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    } = req.body;
    const characterToUpdate = {
      char_name,
      title,
      char_class,
      race,
      background,
      alignment,
      char_level,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    };
    const numberOfValues = Object.values(characterToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain a changed value',
        },
      });

    for (const [key, value] of Object.entries(characterToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing ${key} in request body`,
        });
    // Set the user Id in the new character
    characterToUpdate.user_id = req.user.id;

    CharactersService.updateCharacter(
      req.app.get('db'),
      req.params.character_id,
      CharactersService.serializeUpdate(characterToUpdate)
    )
      .then((character) => {
        res
          .status(204)
          .location(path.posix.join(req.originalUrl, `/${character.id}`))
          .json(character);
      })
      .catch(next);
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
