var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

/* GET users listing. */
router.get("/", function (req, res) {
  res.send("respond with a resource");
});

// Router for the signup
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "fullname", "mail", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({
    username: req.body.username,
    fullname: req.body.fullname,
    mail: req.body.mail,
    password: hash,
  }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        fullname: req.body.fullname,
        mail: req.body.mail,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // If the user already exists in database
      res.json({ result: false, error: "User already exists" });
    }
  });
});

// Router for the signin
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["mail", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Check if the user signin with the right information
  User.findOne({ email: req.body.email, password: req.body.password }).then(
    (data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token });
      } else {
        res.json({ result: false, error: "Mail not found or wrong password" });
      }
    }
  );
});

module.exports = router;