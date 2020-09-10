const express = require('express');
const path = require('path');
const ItemsService = require('./items-service');

const itemsRouter = express.Router();
const bodyParser = express.json();

itemsRouter
  .route('/')
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
      user_id: 1,
    };

    for (const [key, value] of Object.entries(newItem))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    // newItem.user_id = req.user.id

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

async function checkItemExists(req, res, next) {
  try {
    const item = await ItemsService.getById(
      req.app.get('db'),
      req.params.item_id
    );

    if (!item)
      return res.status(404).json({
        error: 'Item does not exist',
      });

    res.item = item;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = itemsRouter;
