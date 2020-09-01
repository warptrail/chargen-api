const express = require('express');
const path = require('path');
const xss = require('xss');
const logger = require('../logger');
const CharsheetsService = require('./charsheets-services');

const charsheetsRouter = express.Router();

const bodyParser = express.json; // for POST & PATCH body parsing

const serializeCharsheet = (charsheet) => ({
  id: charsheet.id,
  char_name: xss(charsheet.char_name),
  title: xss(charsheet.title),
  char_class: charsheet.char_class,
  race: charsheet.race,
  background: charsheet.background,
  alignment: charsheet.alignment,
  char_level: charsheet.char_level,
  strength: charsheet.strength,
  dexterity: charsheet.dexterity,
  constitution: charsheet.constitution,
  intelligence: charsheet.intelligence,
  wisdom: charsheet.wisdom,
  charisma: charsheet.charisma,
});

charsheetsRouter.route('/').get((req, res, next) => {
  CharsheetsService.getAllCharsheets(req.app.get('db'))
    .then((charsheets) => {
      res.json(charsheets.map(serializeCharsheet));
    })
    .catch(next);
});

module.exports = charsheetsRouter;
