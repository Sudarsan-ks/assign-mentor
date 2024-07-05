const express = require("express");
const mongoose = require("mongoose");
const Student = require("./model/student");
const Mentor = require("./model/mentor");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());


app.get("/", (req, res)=>{
  res.send("Welocome to Student and Mentor Allocation")
})

//1.Create a Mentor:
app.post("/mentor", async (req, res) => {
  try {
    const { name } = req.body;
    const newMentor = new Mentor({ name });
    await newMentor.save();
    res.status(201).json(newMentor);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

//1.Create a Student:
app.post("/student", async (req, res) => {
  try {
    const { name, mentorID } = req.body;

    if (mentorID) {
      const mentorExist = await Mentor.findById(mentorID);
      if (!mentorExist) {
        return res.status(400).json({ message: "Mentor not fount" });
      }
    }
    const newStudent = new Student({ name, mentor: mentorID });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ message: "Error creating student" });
  }
});

//3. Assigning student to a mentor:
app.post("/assignStudent", async (req, res) => {
  try {
    const { mentorID, studentID } = req.body;
    if (mentorID) {
      const mentorExist = await Mentor.findById(mentorID);
      if (!mentorExist) {
        return res.status(400).json({ message: "Mentor not fount" });
      }
    }
    const student = await Student.find({
      _id: { $in: studentID },
      mentor: { $exists: false },
    });
    if (student.length !== studentID.length) {
      return res
        .status(400)
        .json({ message: "Student not found or Already have mentor" });
    }

    await Student.updateMany(
      { _id: { $in: studentID } },
      { $set: { mentor: mentorID } }
    );

    res
      .status(200)
      .json({ message: "Sucessfully student assigned to a mentor", student });
  } catch (err) {
    res.status(500).json({ message: "Error while assgning student" });
  }
});

//4. write an API to Assign or change mentor for a particular student:
app.post("/changeOrAssign", async (req, res) => {
  const { studentID, mentorID } = req.body;
  if (mentorID) {
    const mentorExist = await Mentor.findById(mentorID);
    if (!mentorExist) {
      return res.status(400).json({ message: "Mentor not fount" });
    }
  }
  const studentExist = await Student.findById(studentID);
  if (!studentExist) {
    return res.status(404).send({ message: "Student not found" });
  }
  studentExist.mentor = mentorID;
  await studentExist.save();
  res.status(201).json({ message: "Mentor Assigned or changed" });
});

//5. Write an API to show all students for a particular mentor:
app.get("/StudentsOfMentor/:mentorID", async (req, res) => {
  try {
    const { mentorID } = req.params;
    const student = await Student.find({ mentor: mentorID });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

//6. Write an API to show previously assigned mentor for a particular student:
app.get("/PreviousMentorsOfStudent/:studentID", async (req, res) => {
  try {
    const { studentID } = req.params;
    const studentExist = await Student.findById(studentID);
    if (!studentExist) {
      return res.status(404).send({ message: "Student not found" });
    }
    const previousMentor = await Mentor.findById(studentExist.mentor);
    if (!previousMentor) {
      return res.status(400).json({ message: "Previous mentor not found" });
    }
    res.status(201).json(previousMentor);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB is connected");
    app.listen(PORT, () => {
      console.log(`Server has started in port number ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error message", err);
  });
