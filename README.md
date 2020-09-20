# Chargen

## Fantasy Character Generator (API)

**Description:** Create and store your Dungeons & Dragons characters with this tool. Add as many as you need, edit them, randomize their stats, and add special items to their inventories.

**Link to live app:** [https://chargen-client.vercel.app](https://chargen-client.vercel.app)

**Tech Stack:**

- **Backend** - Node.js - Express - Postgresql
- **Frontend** - React

# Instructions to Clone

1. Clone from [Github](https://github.com/warptrail/chargen-client)
2. Set up the client side from this [link](https://github.com/warptrail/chargen-api)
3. Set up your postgres database and run npm migrate
4. Make sure your .env file is set up with proper variable names
5. Run `npm run dev` or `npm start` for the api back-end code
6. Run `npm start` to open the client-side app

# API Documentation

This side of the codebase deals with storing user information and their related characters using a PostgreSQL database. The Character information is stored on a separate table than the Item information. There is a one-to-many relationship between characters and items.

The user authentication system is also handled in this codebase. It uses a JWT and the passwords are securely hashed when going into the database. See the package.json file for a list of dependencies.

All endpoints are protected with JWT authentication tokens.

## API Overview

```text
/api
.
├── /auth/login
│   └── POST
│       ├── /login
│       └── /refresh
├── /users
│   └── POST
│       └── /
├── /characters
│   └── GET
│       ├── /
│       ├── /:character_id
│       ├── /:character_id/items
│   └── POST
│       └── /
│   └── PATCH
│       ├── /:character_id
│   └── DELETE /:character_id
├── /items
│   └── GET
│       ├── /
│       ├── /:item_id
│   └── POST
│       └── /
│   └── DELETE
│       └── /:item_id
```

## Auth endpoints

- For logging in as an existing user to make initial JWT authentication token and refreshing the token.

### POST `/api/auth/login`

```js
// req.body
{
  user_name: String,
  password: String
}

// res.body
{
  authToken: String
}
```

### POST `/api/auth/refresh`

```js
// req.header
Authorization: Bearer ${token}

// res.body
{
  authToken: ${token}
}
```

## User endpoints

- For creating a new user via a POST request.

### POST `/api/users/`

```js
// req.body
{
  user_name: String,
  password: String
}

// res.body
{
  id: Number,
  user_name: String,
  date_created: String
}
```

## Characters endpoints

### GET `/api/characters`

Returns an array of character information that belong to the user currently signed in.

```js
// res.body
[
    {
        id: Number,
        char_name: String,
        title: String,
        char_class: String,
        race: String,
        background: String,
        alignment: String,
        char_level: Number,
        strength: Number,
        dexterity: Number,
        constitution: Number,
        intelligence: Number,
        wisdom: Number,
        charisma: Number,
        user: {
            id: Number,
            user_name: String
        },
        number_of_items: Number
    }
  ]
}
```

## `POST /api/characters`

A new character submission is made via a POST request using a json object submitted through the new character form on the client side. All fields are required and the server will return a 400 bad request if fields are missing.

```js
// req.body
{
    "char_name": String,
    "title": String,
    "char_class": String,
    "race": String,
    "background": String,
    "alignment": String,
    "char_level": Number,
    "strength": Number,
    "dexterity": Number,
    "constitution": Number,
    "intelligence": Number,
    "wisdom": Number,
    "charisma": Number
}
// res.body
{
        id: Number,
        char_name: String,
        title: String,
        char_class: String,
        race: String,
        background: String,
        alignment: String,
        char_level: Number,
        strength: Number,
        dexterity: Number,
        constitution: Number,
        intelligence: Number,
        wisdom: Number,
        charisma: Number,
        user: {
            id: Number,
            user_name: String
        },
        number_of_items: Number
    }
```

## GET `/api/characters/:character_id`

- For getting a specific character

```js
// req.params
{
  character_id: id
}

// res.body
{
  id: Number,
  char_name: String,
  title: String,
  char_class: String,
  race: String,
  background: String,
  alignment: String,
  char_level: Number,
  strength: Number,
  dexterity: Number,
  constitution: Number,
  intelligence: Number,
  wisdom: Number,
  charisma: Number,
  user: {
      id: Number,
      user_name: String
  },
  number_of_items: Number
}
```

## DELETE `/api/characters/:character_id`

- For deleting a specific character

```js
// req.params
{
  character_id: id;
}

// res.status
204;
```

## PATCH `/api/characters/:character_id`

- For updating a specific character. At least one field must be changed.

```js

// req.params
{
  character_id: id
}

// req.body
{
    "char_name": String,
    "title": String,
    "char_class": String,
    "race": String,
    "background": String,
    "alignment": String,
    "char_level": Number,
    "strength": Number,
    "dexterity": Number,
    "constitution": Number,
    "intelligence": Number,
    "wisdom": Number,
    "charisma": Number
}
// res.body
{
        id: Number,
        char_name: String,
        title: String,
        char_class: String,
        race: String,
        background: String,
        alignment: String,
        char_level: Number,
        strength: Number,
        dexterity: Number,
        constitution: Number,
        intelligence: Number,
        wisdom: Number,
        charisma: Number,
        user: {
            id: Number,
            user_name: String
        },
        number_of_items: Number
    }
```

## GET `/api/characters/:character_id/items`

- Returns an array of all the items with the character_id specified in the `req.params`

```js
// req.params
{
  character_id: id;
}

// res.body
[
  {
    id: Number,
    item_name: String,
    item_type: String,
    item_description: String,
    item_abilities: String,
    user: {
      id: Number,
      user_name: String,
    },
  },
];
```

## Items endpoints

### GET `api/items`

- Gets an array of all items in the database

```js
// res.body
[
  {
    id: Number,
    item_name: String,
    item_type: String,
    item_description: String,
    item_abilities: String,
    user: {
      id: Number,
      user_name: String,
    },
  },
];
```

### POST `api/items`

- Creates a new item for a character

```js
// req.body
{
  item_name: String,
  item_type: String,
  item_description: String,
  item_abilities: String,
  character_id: Number
}
// res.body
{
    id: Number,
    item_name: String,
    item_type: String,
    item_description: String,
    item_abilities: String,
    character: {
        id: 25,
        character_name: String
    },
    user: {
        id: 1,
        user_name: String
    }
}
```

### GET `api/items/:item_id`

- Gets a specific item

```js

// req.params
{
  item_id: id;
}

// res.body
{
    id: Number,
    item_name: String,
    item_type: String,
    item_description: String,
    item_abilities: String,
    character: {
        id: 25,
        character_name: String
    },
    user: {
        id: 1,
        user_name: String
    }
}
```

### DELETE `api/items/:item_id`

- Deletes a specific item

```js
// req.params
{
  item_id: id;
}

// res.status
204;
```

## Screenshots:

Login or create a new account first

![](img/chargen_01_login.png)

Go to your main menu

![](img/chargen_02_main_menu.png)

Make edits and review

![](img/chargen_03_char_sheet.png)

Add items

![](img/chargen_04_items.png)
