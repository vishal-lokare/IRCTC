# IRCTC

Webserver - NodeJS / ExpressJS <br>
Database - PostgreSQL <br>
ORM - Sequelize <br>

## Database Schema:
Tables - User, Train, Booking

User - 
- username : string
- email : string
- password : string
- role : ENUM('admin', 'user')

Train - 
- train_num : int
- src : string
- dest : string
- avl_seats : int

Booking - 
- booking_id : int, autoIncrement
- username : string
- train_num : int
- booking_time : DATE

## API Endpoints

### Auth
- POST /register
    - Request {username, email, password}
    - Response {message}
- POST /login 
    - Request {username, password}
    - Response {token}

### Trains
- POST /admin/trains
    - Request {train_num, src, dest, avl_seats}, token, API_KEY
    - Response {message}
- GET /trains
    - Request ?source="`source`"&destination="`destination`", token
    - Response {trains[]}

### Booking
- POST /book
    - Request {train_num}, token
    - Response {message}

- GET /ticket
    - Request ?booking_id=`int`, token
    - Response {booking}

## Installation and running the server
- Clone the repository
- Run `npm install`
- Run `npm run initialize` to create the database and tables
- Run `npm start` to start the server

Note: <br>
- ADMIN_API_KEY is stored in .env file
- JWT_SECRET is stored in .env file
