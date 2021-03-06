const xss = require('xss');
const Treeize = require('treeize');

const ItemsService = {
  getAllItems(knex) {
    return knex
      .from('items AS itm')
      .select(
        'itm.id',
        'itm.item_name',
        'itm.item_type',
        'itm.item_description',
        'itm.item_abilities',
        ...userFields,
        ...characterFields
      )
      .leftJoin('characters AS chr', 'chr.id', 'itm.character_id')
      .leftJoin('users AS usr', 'itm.user_id', 'usr.id');
  },

  getById(knex, id) {
    return ItemsService.getAllItems(knex).where('itm.id', id).first();
  },

  serializeItems(items) {
    return items.map(this.serializeItem);
  },

  serializeItem(item) {
    const itemTree = new Treeize();
    const itemData = itemTree.grow([item]).getData()[0];

    return {
      id: itemData.id,
      item_name: itemData.item_name,
      item_type: itemData.item_type,
      item_description: itemData.item_description,
      item_abilities: itemData.item_abilities,
      character: itemData.character || {},
      user: itemData.user || {},
    };
  },

  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('items')
      .returning('*')
      .then(([item]) => ItemsService.getById(knex, item.id));
  },

  deleteItem(knex, id) {
    return knex('items').where({ id }).delete();
  },
};

const userFields = ['usr.id AS user:id', 'usr.user_name AS user:user_name'];
const characterFields = [
  'chr.id As character:id',
  'chr.char_name AS character:character_name',
];

module.exports = ItemsService;

// TODO: Use xxs on serialize methods
