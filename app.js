import "dotenv/config";
import bodyParser from "body-parser";
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import md5 from "md5";

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
// creating a new database for user
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// encrypting the information of the user
userSchema.plugin(encrypt, {
  secret: process.env.SECRETE,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const newUser = User({
    username: req.body.username,
    password: md5(req.body.password),
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

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = md5(req.body.password);

    const foundUser = await User.findOne({ username: username });

    if (!foundUser) {
      return res.send("user not found");
    }
    if (foundUser.password === password) {
      res.render("secrets.ejs");
    } else {
      res.send("Incorrect password");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
