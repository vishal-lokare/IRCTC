const Sequelize = require("sequelize");

// replace with your database name and password
// here, i have used "IRCTC" as database, "postgres" as username and "vish" as password
const sequelize = new Sequelize("IRCTC", "postgres", "vish", {
  host: "localhost",
  dialect: "postgres",
});

module.exports = sequelize;