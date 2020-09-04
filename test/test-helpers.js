// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      user_name: 'test-user-4',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeCharactersArray() {
  return [
    {
      id: 1,
      char_name: 'Sylvanas',
      title: 'Banshee Queen',
      char_class: 'Ranger',
      race: 'Undead',
      background: 'Survivor from the old wars',
      alignment: 'Chaotic Evil',
      char_level: 60,
      strength: 13,
      dexterity: 16,
      constitution: 12,
      intelligence: 14,
      wisdom: 9,
      charisma: 10,
      user_id: 1,
    },
    {
      id: 2,
      char_name: 'Thrall',
      title: 'Master of the Elements',
      char_class: 'Shaman',
      race: 'Orc',
      background:
        'Ex Warchief who discovered the path to walk with the Elements',
      alignment: 'Chaotic Neutral',
      char_level: 8,
      strength: 13,
      dexterity: 16,
      constitution: 12,
      intelligence: 14,
      wisdom: 9,
      charisma: 10,
      user_id: 2,
    },
    {
      id: 3,
      char_name: 'Varian Wrynn',
      title: 'King of Stormwind',
      char_class: 'Fighter',
      race: 'Human',
      background: 'First Born of King Llane and Queen Taria.',
      alignment: 'Lawful Good',
      char_level: 55,
      strength: 13,
      dexterity: 16,
      constitution: 12,
      intelligence: 14,
      wisdom: 9,
      charisma: 10,
      user_id: 3,
    },
    {
      id: 4,
      char_name: 'Loktar Omega',
      title: 'Swamp Patrol',
      char_class: 'Barbarian',
      race: 'Ogre',
      background: 'Protector of the Sacred Swamp!',
      alignment: 'Lawful Good',
      char_level: 2,
      strength: 13,
      dexterity: 16,
      constitution: 12,
      intelligence: 14,
      wisdom: 9,
      charisma: 10,
      user_id: 4,
    },
  ];
}

function makeItemsArray(users, characters) {
  return [
    {
      id: 1,
      item_name: 'magical item 1',
      item_type: 'trinket',
      item_description: 'a smooth grey stone with a vibe about it',
      item_abilities: '+2 to all perception checks',
      character_id: 1,
      user_id: 1,
    },
    {
      id: 2,
      item_name: 'magical item 2',
      item_type: 'off-hand',
      item_description: 'a purple umbrella that chimes in the rain',
      item_abilities: '+1 to charisma',
      character_id: 2,
      user_id: 1,
    },
    {
      id: 3,
      item_name: 'magical item 3',
      item_type: 'weapon',
      item_description: 'a mysterious dagger.',
      item_abilities: '+1 to all stealth checks',
      character_id: 2,
      user_id: 1,
    },
    {
      id: 4,
      item_name: 'magical item 4',
      item_type: 'armor',
      item_description: 'a shield that can emit a bubble of invisibility',
      item_abilities: 'invisible for 10 minutes with 24 hour recharge',
      character_id: 1,
      user_id: 1,
    },
  ];
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
      characters,
      users,
      items`
      )
      .then(() =>
        Promise.all([
          trx.raw('ALTER SEQUENCE characters_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE items_id_seq minvalue 0 START WITH 1'),
          trx.raw('SELECT setval(\'characters_id_seq\', 0)'),
          trx.raw('SELECT setval(\'users_id_seq\', 0)'),
          trx.raw('SELECT setval(\'items_id_seq\', 0)'),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({ ...user }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw('SELECT setval(\'users_id_seq\', ?)', [users[users.length - 1].id])
    );
}

module.exports = {
  makeUsersArray,
  makeCharactersArray,
  makeItemsArray,
  cleanTables,
};