const mongoose = require("mongoose");

const mentorSchema = mongoose.Schema({
  name: { type: String, required: true },
});

const Mentor = mongoose.model("mentor", mentorSchema);
module.exports = Mentor;
