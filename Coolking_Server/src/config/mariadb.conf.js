const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,       // database
  process.env.DB_USER,       // user
  process.env.DB_PASS,       // password
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mariadb",
    port: process.env.DB_PORT || 3306,
    logging: false, // true for logging query
    dialectOptions: {
      charset: "utf8mb4",
      timezone: '+07:00', // for reading from database
    },
    timezone: '+07:00', // for writing to database
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  }
);

module.exports = sequelize;
