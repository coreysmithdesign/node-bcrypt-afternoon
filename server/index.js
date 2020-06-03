// require dotfile, express, session, massive
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const massive = require("massive");
const authCtrl = require("./controllers/authController");
const treasureCtrl = require("./controllers/treasureController");
const auth = require("./middleware/authMiddleware");

// import port num, db connection, session secret from .env file
const { PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

// invode express and set to app
const app = express();

// use express.json
app.use(express.json());

// connect massive to database with connection string from .env
massive({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
}).then((db) => {
  app.set("db", db);
  console.log("db connected");
});

// create a session with session secret from .env
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: SESSION_SECRET,
  })
);

// authorization endpoint
app.post("/auth/register", authCtrl.register);
app.post("/auth/login", authCtrl.login);
app.get("/auth/logout", authCtrl.logout);

// treasures
app.get("/api/treasure/dragon", treasureCtrl.dragonTreasure);
app.get("/api/treasure/user", auth.usersOnly, treasureCtrl.getUserTreasure);
app.post("/api/treasure/user", auth.usersOnly, treasureCtrl.addUserTreasure);
app.get(
  "/api/treasure/all",
  auth.usersOnly,
  auth.adminsOnly,
  treasureCtrl.getAllTreasure
);

// listen on port with port from .env
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
