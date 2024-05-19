const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Booking = sequelize.define("Booking", {
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    train_num: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    booking_time: {
        type: DataTypes.DATE
    }
}, {
    timestamps: false
});

module.exports = Booking;