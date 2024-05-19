const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Train = sequelize.define("Trains", {
  train_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  src: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dest: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avl_seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  timestamps: false
});

module.exports = Train;