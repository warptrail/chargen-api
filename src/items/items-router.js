const express = require('express');
const path = require('path');
const ItemsService = require('./items-service');
const logger = require('../logger');

const { requireAuth } = require('../middleware/jwt-auth');

const itemsRouter = express.Router();
const bodyParser = express.json();

// Endpoint for get and post a specific character's items
itemsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    ItemsService.getAllItems(req.app.get('db'))
      .then((items) => {
        res.json(ItemsService.serializeItems(items));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const {
      item_name,
      item_type,
      item_description,
      item_abilities,
      character_id,
    } = req.body;
    const newItem = {
      item_name,
      item_type,
      item_description,
      item_abilities,
      character_id,
      user_id: req.user.id,
    };

    // Validate items have values for each key
    for (const [key, value] of Object.entries(newItem))
      if (value === null) {
        logger.error(`Missing '${key}' in request body`);
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });
      }

    // Add new item to database
    ItemsService.insertItem(req.app.get('db'), newItem)
      .then((item) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(ItemsService.serializeItem(item));
      })
      .catch(next);
  });

itemsRouter
  .route('/:item_id')
  .all(requireAuth)
  .all(checkItemExists)
  .get((req, res) => {
    res.json(ItemsService.serializeItem(res.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(req.app.get('db'), req.params.item_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

// validation middleware to check if item exists
async function checkItemExists(req, res, next) {
  try {
    const item = await ItemsService.getById(
      req.app.get('db'),
      req.params.item_id
    );

    if (!item) {
      logger.error('Item does not exist');
      return res.status(404).json({
        error: 'Item does not exist',
      });
    }

    res.item = item;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = itemsRouter;
