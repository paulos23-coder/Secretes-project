import "dotenv/config";
import bodyParser from "body-parser";
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

const MONGO_URI = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to Atlas"))
  .catch((err) => console.log(err));

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(
  session({
    secret: "Our little secrete",
    resave: false, // dont save the seesion data if anything happened.
    saveUninitialized: false, // dont inialize session unless a user logged in.
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose.default); // to hash and salt clients password and store inside db.

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy()); // checks username and password from the DB
passport.serializeUser(User.serializeUser()); //stores  the user id in the session
passport.deserializeUser(User.deserializeUser()); // reades user id from session and fetch full user info from db to atach into req.user.

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("/secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// encrypting users password using bcrypt.
app.post("/register", async (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    },
  );
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secretes");
      });
    }
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
