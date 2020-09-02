CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_description TEXT NOT NULL,
  item_abilities TEXT NOT NULL,
  character_id INTEGER
    REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER
    REFERENCES users(id) ON DELETE CASCADE NOT NULL
);