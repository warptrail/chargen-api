const express = require('express');
const path = require('path');

const logger = require('../logger');
const CharactersService = require('./characters-services');

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
  .post(bodyParser, (req, res, next) => {
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
      user_id: 1,
    };
    for (const [key, value] of Object.entries(newCharacter))
      if (value == null)
        return res.status(400).json({
          error: `Missing ${key} in request body`,
        });
    CharactersService.insertCharacter(req.app.get('db'), newCharacter)
      .then((character) => {
        console.log(character);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${character.id}`))
          .json(character);
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
  .patch(bodyParser, (req, res, next) => {
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
      id: req.params.character_id,
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
      user_id: 1,
    };
    const numberOfValues = Object.values(characterToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain a changed value',
        },
      });

    CharactersService.updateCharacter(
      req.app.get('db'),
      req.params.character_id,
      characterToUpdate
    )
      .then((character) => {
        return character;
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
