const db = require("knex")({
  client: "pg",
  ssl: true,
  connection: {
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "aula",
    charset: "utf8",
  },
  searchPath: ["knex", "public"],
  migrations: {
    tableName: "migrations",
  },
});


module.exports = db;
