const xss = require('xss');
const Treeize = require('treeize');

const CharactersService = {
  getAllCharacters(knex) {
    return knex
      .from('characters AS chr')
      .select(
        'chr.id',
        'chr.char_name',
        'chr.title',
        'chr.char_class',
        'chr.race',
        'chr.background',
        'chr.alignment',
        'chr.char_level',
        'chr.strength',
        'chr.dexterity',
        'chr.constitution',
        'chr.intelligence',
        'chr.wisdom',
        'chr.charisma',
        ...userFields,
        knex.raw('count(DISTINCT itm) AS number_of_items')
      )
      .leftJoin('items AS itm', 'chr.id', 'itm.character_id')
      .leftJoin('users AS usr', 'chr.user_id', 'usr.id')
      .groupBy('chr.id', 'usr.id');
  },
  getById(knex, id) {
    return CharactersService.getAllCharacters(knex).where('chr.id', id).first();
  },
  insertCharacter(knex, newCharacter) {
    return knex
      .insert(newCharacter)
      .into('characters')
      .returning('*')
      .then(([character]) => {
        return CharactersService.getById(knex, character.id);
      });
  },
  deleteCharacter(knex, id) {
    return knex('characters').where({ id }).delete();
  },
  updateCharacter(knex, id, newCharacterFields) {
    return knex('characters').where({ id }).update(newCharacterFields);
  },

  serializeCharacters(Characters) {
    return Characters.map(this.serializeCharacter);
  },

  serializeCharacter(character) {
    const characterTree = new Treeize();

    // 'treeize' only accepts arrays of objects
    // trick to use a single object:
    const characterData = characterTree.grow([character]).getData()[0];

    return {
      id: characterData.id,
      char_name: xss(characterData.char_name),
      title: xss(characterData.title),
      char_class: characterData.char_class,
      race: characterData.race,
      background: characterData.background,
      alignment: characterData.alignment,
      char_level: characterData.char_level,
      strength: characterData.strength,
      dexterity: characterData.dexterity,
      constitution: characterData.constitution,
      intelligence: characterData.intelligence,
      wisdom: characterData.wisdom,
      charisma: characterData.charisma,
      user: characterData.user || {},
      number_of_items: characterData.number_of_items,
    };
  },

  getItemsForCharacter(db, character_id) {
    return db
      .from('items AS itm')
      .select(
        'itm.id',
        'itm.item_name',
        'itm.item_type',
        'itm.item_description',
        'itm.item_abilities',
        ...userFields
      )
      .where('itm.character_id', character_id)
      .leftJoin('users AS usr', 'itm.user_id', 'usr.id')
      .groupBy('itm.id', 'usr.id');
  },

  serializeCharacterItems(items) {
    return items.map(this.serializeCharacterItem);
  },

  serializeCharacterItem(item) {
    const itemTree = new Treeize();

    const itemData = itemTree.grow([item]).getData()[0];
    console.log(itemData);

    return {
      id: itemData.id,
      item_name: itemData.item_name,
      item_type: itemData.item_type,
      item_description: itemData.item_description,
      item_abilities: itemData.item_abilities,
      character_id: itemData.character_id,
      user: itemData.user || {},
    };
  },
};

const userFields = ['usr.id AS user:id', 'usr.user_name AS user:user_name'];

module.exports = CharactersService;