const mongoose = require("mongoose");
const connect = mongoose.connect(
  "mongodb://localhost:27017/tutalim-deneme-local"
);

connect
  .then(() => {
    console.log("Connected to the database.");
  })
  .catch(() => {
    console.log("Connection failed.");
  });

const LoginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["emlakçı", "ev sahibi"] },
});

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;
