const charsheetService = {
  getAllCharsheets(knex) {
    return knex.select('*').from('charsheets');
  },
  getById(knex, id) {
    return knex.from('charsheets').select('*').where('id', id).first();
  },
  insertCharsheets(knex, newCharsheet) {
    return knex
      .insert(newCharsheet)
      .into('charsheets')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  deleteCharsheet(knex, id) {
    return knex('charsheets').where({ id }).delete();
  },
  updateCharsheet(knex, id, newCharsheetFields) {
    return knex('charsheets').where({ id }).update(newCharsheetFields);
  },
};

module.exports = charsheetService;
