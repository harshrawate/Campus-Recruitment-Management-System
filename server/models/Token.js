const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  token: { type: String, required: true },
  created_at: { type: Date, required: true, index: { expires: "5m" } },
});

module.exports = mongoose.model("Token", tokenSchema);
