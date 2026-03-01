//jshint esversion:6
import bodyParser from "body-parser";
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = {
  username: String,
  password: String,
};

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const newUser = User({
    email: req.body.username,
    password: req.body.password,
  });

  try {
    await newUser.save();
    res.render("secrets.ejs");
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
