//jshint esversion:6
import bodyParser from "body-parser";
import express from "express";
import ejs from "ejs";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
