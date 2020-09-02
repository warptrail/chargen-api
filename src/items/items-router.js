const express = require('express');
const path = require('path');
const ItemsService = require('./items-service');

const itemsRouter = express.Router();
const jsonBodyParser = express.json();

itemsRouter.route('/').get((req, res, next) => {
  ItemsService.getAllItems(req.app.get('db'))
    .then((items) => {
      res.json(ItemsService.serializeItems(items));
    })
    .catch(next);
});

module.exports = itemsRouter;
