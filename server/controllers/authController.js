const bcrypt = require("bcryptjs");

module.exports = {
  // USER REGISTRATION METHOD //
  register: async (req, res) => {
    const { username, password, isAdmin } = req.body;
    const db = req.app.get("db");

    const result = await db.get_user([username]);
    const existingUser = result[0];

    // check if user exists, send 409 if so
    if (existingUser) {
      return res.status(409).send("Username is taken");
    }

    // if that user does not exist generate salt and hash the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // create the new user
    const registeredUser = await db.register_user([isAdmin, username, hash]);
    const user = registeredUser[0];

    // set user on session
    req.session.user = {
      isAdmin: user.is_admin,
      username: user.username,
      id: user.id,
    };

    // send back new user
    res.status(201).send(req.session.user);
  },

  // USER LOGIN METHOD //
  login: async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await req.app.get("db").get_user([username]);
    const user = foundUser[0];
    if (!user) {
      return res
        .status(401)
        .send(
          "User not found. Please register as a new user before loggin in."
        );
    }
    const isAuthenticated = bcrypt.compareSync(password, user.hash);
    if (!isAuthenticated) {
      return res.status(403).send("Incorrect password");
    }
    req.session.user = {
      isAdmin: user.is_admin,
      id: user.id,
      username: user.username,
    };
    return res.send(req.session.user);
  },

  // USER LOGOUT METHOD //
  logout: async (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  },
};
