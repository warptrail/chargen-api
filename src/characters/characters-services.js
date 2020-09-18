const xss = require('xss');
const Treeize = require('treeize');

const CharactersService = {
  getAllCharacters(knex, user_id) {
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
      .where('usr.id', user_id)
      .groupBy('chr.id', 'usr.id');
  },
  getById(knex, id, user_id) {
    return CharactersService.getAllCharacters(knex, user_id)
      .where('chr.id', id)
      .first();
  },
  insertCharacter(knex, newCharacter) {
    return knex
      .insert(newCharacter)
      .into('characters')
      .returning('*')
      .then(([character]) => {
        return CharactersService.getById(
          knex,
          character.id,
          newCharacter.user_id
        );
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
      char_class: xss(characterData.char_class),
      race: xss(characterData.race),
      background: xss(characterData.background),
      alignment: xss(characterData.alignment),
      char_level: parseFloat(characterData.char_level),
      strength: parseFloat(characterData.strength),
      dexterity: parseFloat(characterData.dexterity),
      constitution: parseFloat(characterData.constitution),
      intelligence: parseFloat(characterData.intelligence),
      wisdom: parseFloat(characterData.wisdom),
      charisma: parseFloat(characterData.charisma),
      user: characterData.user || {},
      number_of_items: parseFloat(characterData.number_of_items),
    };
  },

  serializeUpdate(character) {
    return {
      char_name: character.char_name,
      title: character.title,
      char_class: character.char_class,
      race: character.race,
      background: character.background,
      alignment: character.alignment,
      char_level: character.char_level,
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma,
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
