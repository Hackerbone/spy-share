const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Note = require("./models/Note");
const path = require("path");

require("dotenv").config();
// passport config

require("./config/passport")(passport);
//Bodyparser
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// Build file serving using express
app.use(express.static("build"));

app.use(express.static(path.join(__dirname, "build")));

// cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//Express Sessions
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("secret"));

// Passport

app.use(passport.initialize());
app.use(passport.session());

//DB Config

const db = require("./config/keys").MongoURI;

//Connect to MONGODB

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MONGODB Connection established"))
  .catch((err) => console.log(err));

//=======================ROUTES=====================================//

app.get("/", (req, res) => {
  console.log(req.user);
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
// app.use("/", require("./routes/index"));
// app.use("/users", require("./routes/users"));

//Login Route

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("ERR", err);
    console.log("user", user);

    if (err) throw err;
    if (!user) res.send("User doesn't exist");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Authentication successful");
        console.log("REQUSER", req.user);
      });
    }
  })(req, res, next);
});

//Register Route

app.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  console.log("REQ BOD", req.body);
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
        res.send("User Exists");
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
                res.send("Registration Successful");
              })
              .catch((err) => console.log(err));
          })
        );
        console.log(newUser);
      }
    });
  }
});
// Get User
app.get("/user", (req, res) => {
  res.send(req.user);
});

// Logout
app.get("/logout", function (req, res) {
  req.logout();
  res.send("Logged out successfully");
});

//___________________________NOTES_______________________//

app.post("/create", async (req, res) => {
  const note = new Note({
    title: req.body.title,
    description: req.body.description,
    owner: req.user.email,
  });

  try {
    const noteRes = await note.save();
    await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $push: { notes: note } },
      {
        useFindAndModify: false,
      }
    );
    await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $push: { note_ids: note._id } },
      {
        useFindAndModify: false,
      }
    );

    res.json(noteRes);
  } catch (err) {
    res.send("Error in creating");
    console.log(err);
  }
});

app.post("/share/:id", async (req, res) => {
  const id = req.params.id;
  console.log("");
  const noteUser = await User.findById({ _id: req.user._id });
  const user = await User.findOne({ email: req.body.userEmail });
  console.log("USer", user);
  console.log("USer emal", req.body.userEmail);

  if (noteUser.note_ids.includes(id)) {
    try {
      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          $push: { note_ids: id },
        },
        {
          useFindAndModify: false,
        }
      ).then((response) => {
        res.send(response);
      });
    } catch (err) {
      res.send("Error in fetching");
    }
  } else {
    res.send("Cannot Modify Other's notes");
  }
});

app.get("/getNotes", async (req, res) => {
  try {
    const noteRes = await Note.find();
    const user = await User.findById({ _id: req.user._id });
    const filterNotes = [];
    noteRes.forEach((item) => {
      if (user.note_ids.includes(item._id)) {
        filterNotes.push(item);
      }
    });

    res.json(filterNotes);
  } catch (err) {
    res.send("Error in fetching");
  }
});

app.get("/getNote/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById({ _id: req.user._id });
  if (user.note_ids.includes(id)) {
    try {
      const note = await Note.findById({ _id: id });
      res.send(note);
    } catch (err) {
      res.send("Error in fetching");
    }
  } else {
    res.send("Cannot send other user's notes");
  }
});

app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById({ _id: req.user._id });
  if (user.note_ids.includes(id)) {
    try {
      await Note.findByIdAndDelete({ _id: id }).then((response) => {
        res.send(response);
      });
    } catch (err) {
      res.send("Error in fetching");
    }
  } else {
    res.send("Cannot delete someone else's notes");
  }
});

app.get("/delete-shared/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById({ _id: req.user._id });
  if (user.note_ids.includes(id)) {
    try {
      await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { note_ids: id } }, { safe: true, upsert: true }).then((response) => {
        res.send(response);
      });
    } catch (err) {
      res.send("Error in fetching");
    }
  } else {
    res.send("Cannot delete someone else's notes");
  }
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;

  const user = await User.findById({ _id: req.user._id });

  if (user.note_ids.includes(id)) {
    try {
      await Note.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            modifiedDate: req.body.modifiedDate,
          },
        },
        {
          useFindAndModify: false,
        }
      ).then((response) => {
        res.send(response);
      });
    } catch (err) {
      res.send("Error in fetching");
    }
  } else {
    res.send("Cannot Modify Other's notes");
  }
});

//======================================================================//

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log("Server hosted on http://localhost:5000"));
