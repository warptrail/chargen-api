BEGIN;

TRUNCATE
    items, characters, users RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password)
VALUES
('warptrail', '1234'),
('quantum-man', '1234'),
('larry', '1234'),
('space-cowboy', '1234');

INSERT INTO characters (char_name, title, char_class, race, background, alignment, char_level, strength, dexterity, constitution, intelligence, wisdom, charisma, user_id)
VALUES
    ('Zenn Stonebloom','Void Guardian','Ranger','Wood Elf','Pirate','Chaotic Neutral',3,11,14,11,10,13,11, 1),
    ('Elektor','The Sand Piper','Bard','Gnome','Farmer','Chaotic good',1,9,12,13,12,11,18, 2),
    ('Larrazo Smashtastic','Breaker of Things','Barbarian','Human','Outlaw','Chaotic evil',5,18,8,15,10,12,11, 3),
    ('Esadris Leafmane','Quantum Protector','Mage','Feral-Elf','Space Entity','Chaotic good',10,13,18,14,18,19,17, 4);

INSERT INTO items (item_name, item_type, item_description, item_abilities, character_id, user_id)
VALUES
    ('Helm of Endurance', 'armor', 'A steel helmet forged by the Dwarves of the Mountain.', 'Weight of all items decreased by 20%', 1, 1),
    ('Helm of Endurance', 'armor', 'A steel helmet forged by the Dwarves of the Mountain.', 'Weight of all items decreased by 20%', 2, 1),
    ('Helm of Endurance', 'armor', 'A steel helmet forged by the Dwarves of the Mountain.', 'Weight of all items decreased by 20%', 2, 1),
    ('Helm of Endurance', 'armor', 'A steel helmet forged by the Dwarves of the Mountain.', 'Weight of all items decreased by 20%', 2, 1);

COMMIT;