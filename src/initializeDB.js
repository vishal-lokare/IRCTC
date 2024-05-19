const sequelize = require("../utils/database");

const User = require("../models/user");
const Booking = require("../models/booking");
const Train = require("../models/train");

sequelize.sync({ force: true }).then(() => {
  console.log("Database & tables created!");
});
