const { Model } = require("objection");
const knex = require("../database/db");

Model.knex(knex);

class accounts extends Model {
  static get tableName() {
    return "accounts";
  }

  // to make relation with other tables
  //static get relationMappings() {}
}

module.exports = accounts;
