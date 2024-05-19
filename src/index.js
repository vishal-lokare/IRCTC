const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("../utils/database");
const {
  BadRequestError,
  CreatedResponse,
  UnauthorizedError,
  OkResponse,
} = require("../utils/responseHandler");
const Train = require("../models/train");
const User = require("../models/user");
const Booking = require("../models/booking");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const apiKeyAuth = require("../middleware/apiKeyAuthorization");
const { Op } = require("sequelize");

// const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'IRCTC',
//     password: 'vish',
//     port: 5432,
//   });

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// 1. Signup API
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);

  // Return error if any field is missing
  if (!username || !email || !password) {
    BadRequestError(res, "All fields are required");
    return;
  }

  // Check if username or email already exist
  const doesUsernameExist = await User.findOne({
    where: { username: username },
  });
  if (doesUsernameExist) {
    console.log(doesUsernameExist);
    BadRequestError(res, "Username already exists");
    return;
  }

  const doesEmailExist = await User.findOne({ where: { email: email } });
  if (doesEmailExist) {
    BadRequestError(res, "Email already exists");
    return;
  }

  // Hash the password and save in DB
  const salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(password, salt);

  User.create({
    username: username,
    email: email,
    password: hashedPassword,
    role: "user", // storing role as user by default
  });

  CreatedResponse(res, `${username} User created successfully`);
});

//2. Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userExists = await User.findOne({ where: { username: username } });

  if (userExists === null) {
    UnauthorizedError(res, "User does not exist");
  } else {
    // Check the password with the hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExists.password
    );
    if (!isPasswordCorrect) {
      UnauthorizedError(res, "Wrong password");
    } else {
      const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      OkResponse(res, { token: token });
    }
  }
});

//3. Add a new train
app.post("/admin/trains", apiKeyAuth, (req, res) => {
  const { trainNum, source, destination, availableSeats } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      UnauthorizedError(res, "Invalid token");
    } else {
      const train = await Train.create({
        train_num: trainNum,
        src: source,
        dest: destination,
        avl_seats: availableSeats,
      }).then((train) => {
        CreatedResponse(res, "Train added successfully");
      }).catch((err) => {
        BadRequestError(res, "Error adding train");
      });
    }
  });
});

//4. Get trains between source and destination
app.get("/trains", async (req, res) => {
  const { source, destination } = req.query;
  const token = req.headers.authorization.split(" ")[1];
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      UnauthorizedError(res, "Invalid token");
    } else {
      const trains = await Train.findAll({
        where: {
          src: source,
          dest: destination,
          avl_seats: {
            [Op.gt]: 0,
          }
        },
      });
      OkResponse(res, trains);
    }
  });
});

//5. Book a ticket
app.post("/book", async (req, res) => {
  const { trainNum } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      UnauthorizedError(res, "Invalid token");
    } else {
      // TODO: Handle the race condition
      const train = await Train.findOne({ where: { train_num: trainNum } });

      if (train.avl_seats > 0) {
        train.avl_seats = train.avl_seats - 1;
        train.save();
        const booking = await Booking.create({
          train_num: trainNum,
          booking_time: new Date(),
          username: decoded.username
        });
        CreatedResponse(res, "Ticket booked successfully");
      } else {
        BadRequestError(res, "No seats available");
      }
    }
  });
});

//6. Get specific ticket
app.get("/ticket", async (req, res) => {
  const { booking_id } = req.query;
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      UnauthorizedError(res, "Invalid token");
    } else {
      const ticket = await Booking.findOne({ where: { booking_id: booking_id } });
      OkResponse(res, ticket);
    }
  });
});

//7. Update seats in a train
app.put("/admin/trains", apiKeyAuth, async (req, res) => {
  const { trainNum, availableSeats } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      UnauthorizedError(res, "Invalid token");
    } else {
      const train = await Train.findOne({ where: { train_num: trainNum } });
      train.avl_seats = availableSeats;
      train.save();
      OkResponse(res, "Seats updated successfully");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

// API endpoint to check the validity of the token
app.get("/check-token", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      UnauthorizedError(res, "Invalid token");
    } else {
      OkResponse(res, "Valid token");
    }
  });
});
