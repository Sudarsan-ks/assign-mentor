const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  name: { type: String, required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "mentor" },
});

const Student = mongoose.model("student", studentSchema);
module.exports = Student;
