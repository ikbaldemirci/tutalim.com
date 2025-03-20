const express = require("express");
const pasth = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.set("view engine", "ejs");
app.use(express.static("public"));

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
