const express = require("express");

const bcrypt = require("bcryptjs");
const router = express.Router();
//USER MODELS

const User = require("../models/User");

router.get("/login", (req, res) => res.send("Login"));

router.get("/register", (req, res) => res.send("Register"));

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  // Check required fields

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Password does not exist" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters long" });
  }
  if (errors.length > 0) {
    res.send("ERRORS");
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User exists
        errors.push({ msg: "Email already exists" });
        res.send("USER EXISTS");
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // setting hashed password
            newUser.password = hash;

            //savee user

            newUser
              .save()
              .then((user) => {
                console.log("HI");
                res.status(200).json({
                  message: "User successfully Registered!",
                  data: user,
                });
              })
              .catch((err) => console.log(err));
          })
        );
        console.log(newUser);
      }
    });
  }

  router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      faliureRedirect: "/users/login",
    })(req, res, next);
  });
});

module.exports = router;
