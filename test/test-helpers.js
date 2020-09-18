const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      character_id: characters[0].id,
      user_id: users[0].id,
    },
    {
      id: 2,
      item_name: 'magical item 2',
      item_type: 'off-hand',
      item_description: 'a purple umbrella that chimes in the rain',
      item_abilities: '+1 to charisma',
      character_id: characters[0].id,
      user_id: users[1].id,
    },
    {
      id: 3,
      item_name: 'magical item 3',
      item_type: 'weapon',
      item_description: 'a mysterious dagger.',
      item_abilities: '+1 to all stealth checks',
      character_id: characters[0].id,
      user_id: users[2].id,
    },
    {
      id: 4,
      item_name: 'magical item 4',
      item_type: 'armor',
      item_description: 'a shield that can emit a bubble of invisibility',
      item_abilities: 'invisible for 10 minutes with 24 hour recharge',
      character_id: characters[0].id,
      user_id: users[3].id,
    },
  ];
}

function makeCharactersFixtures() {
  const testUsers = makeUsersArray();
  const testCharacters = makeCharactersArray(testUsers);
  const testItems = makeItemsArray(testUsers, testCharacters);
  return { testUsers, testCharacters, testItems };
}

function postNewCharacter(userId) {
  return {
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
    user_id: userId,
  };
}

function postPatchedCharacter(userId) {
  return {
    char_name: 'TROGDOR!',
    title: 'Dragon Man',
    char_class: 'fighter',
    race: 'dragon-born',
    background: 'The System is Down! The System is Down. Beep Boop Bop.',
    alignment: 'Lawful Evil',
    char_level: 29,
    strength: 18,
    dexterity: 16,
    constitution: 18,
    intelligence: 16,
    wisdom: 18,
    charisma: 2,
    user_id: userId,
  };
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

function seedCharactersTable(db, users, characters, items = []) {
  return db.transaction(async (trx) => {
    await seedUsersTable(trx, users);
    await trx.into('characters').insert(characters);
    // update the auto sequence to match the forced id values
    await trx.raw('SELECT setval(\'characters_id_seq\', ?)', [
      characters[characters.length - 1].id,
    ]);
    // only insert items if there are some, also update the sequence counter
    if (items.length) {
      await trx.into('items').insert(items);
      await trx.raw('SELECT setval(\'items_id_seq\', ?)', [
        items[items.length - 1].id,
      ]);
    }
  });
}

function seedUsersTable(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw('SELECT setval(\'users_id_seq\', ?)', [users[users.length - 1].id])
    );
}

function makeExpectedCharacter(user, character, items = []) {
  // const user = users.find((u) => u.id === character.user_id);

  const characterItems = items.filter(
    (item) => item.character_id === character.id
  );

  const number_of_items = characterItems.length;

  return {
    id: character.id,
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
    user: {
      id: user.id,
      user_name: user.user_name,
    },
    number_of_items,
  };
}

function makeExpectedCharacterItems(users, characterId, items) {
  const expectedItems = items.filter(
    (item) => item.character_id === characterId
  );

  return expectedItems.map((item) => {
    const itemUser = users.find((user) => user.id === item.user_id);
    return {
      id: item.id,
      item_name: item.item_name,
      item_type: item.item_type,
      item_description: item.item_description,
      item_abilities: item.item_abilities,
      user: {
        id: itemUser.id,
        user_name: itemUser.user_name,
      },
    };
  });
}

function makeMaliciousCharacter(user) {
  const maliciousCharacter = {
    id: 911,
    char_name: 'Hacker Man <script>alert("xss");</script>',
    title:
      'Attack of the injection!  <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.',
    char_class: 'barbarian',
    race: 'elf',
    background: 'A fabricated origin story',
    alignment: 'chaotic neutral',
    char_level: 99,
    strength: 99,
    dexterity: 99,
    constitution: 99,
    intelligence: 99,
    wisdom: 99,
    charisma: 99,
    user_id: user.id,
  };
  const expectedCharacter = {
    ...makeExpectedCharacter([user], maliciousCharacter),
    char_name: 'Hacker Man &lt;script&gt;alert("xss");&lt;/script&gt;',
    title:
      'Attack of the injection!  <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.',
  };
  return {
    maliciousCharacter,
    expectedCharacter,
  };
}

function seedMaliciousCharacter(db, user, character) {
  return seedUsersTable(db, [user]).then(() =>
    db.into('characters').insert([character])
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    expiresIn: process.env.JWT_EXPIRY,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeCharactersArray,
  makeItemsArray,
  makeCharactersFixtures,
  makeExpectedCharacterItems,
  makeAuthHeader,
  postNewCharacter,
  postPatchedCharacter,
  cleanTables,
  seedCharactersTable,
  makeExpectedCharacter,
  makeMaliciousCharacter,
  seedMaliciousCharacter,
  seedUsersTable,
};
