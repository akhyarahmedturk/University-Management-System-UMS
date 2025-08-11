const mongoose = require('mongoose');
const Course = require('../model/Course');
const Student = require('../model/Student');
const Faculty = require('../model/Faculty');
const bcrypt = require('bcrypt');
const ROLES = require('../config/roleList');
const ObjectId = mongoose.Types.ObjectId;

async function addCourse(req, res) {
    let { courseID, studentID, facultyID } = req.body;

    if (!courseID || !studentID || !facultyID) {
        return res.status(400).json({ message: "Some data missing!" });
    }

    try {
        facultyID = ObjectId.createFromHexString(facultyID);
    } catch (err) {
        return res.status(400).json({ message: "Invalid Faculty ID!" });
    }

    const student = await Student.findOne({ _id: studentID });
    if (!student) return res.status(400).json({ message: "Student does not exist!" });

    const course = await Course.findOne({ _id: courseID });
    if (!course) return res.status(400).json({ message: "Course does not exist!" });

    const faculty = await Faculty.findById(facultyID);
    if (!faculty) return res.status(400).json({ message: "Faculty does not exist!" });

    const duplicate = student.currentCourses?.some(C => C.course.equals(course._id));
    if (duplicate) {
        return res.status(400).json({ message: "This student already took this course!" });
    }

    student.currentCourses.push({ course: course._id, faculty: faculty._id });
    await student.save();

    res.status(200).json({ message: "Course added to student successfully!" });
}


async function removeCourse(req, res) {
    const { code, studentID } = req.body;

    if (!code || !studentID) {
        return res.status(400).json({ message: "Some data missing!" });
    }

    try {
        const student = await Student.findOne({ _id: studentID });
        if (!student) return res.status(400).json({ message: "Student does not exist!" });

        const course = await Course.findOne({ code });
        if (!course) return res.status(400).json({ message: "Course does not exist!" });

        const index = student.currentCourses?.findIndex(C => C.course.equals(course._id));
        if (index === -1) {
            return res.status(400).json({ message: "This student does not have this course!" });
        }

        student.currentCourses.splice(index, 1);
        await student.save();

        res.status(200).json({ message: "Course removed from student successfully!" });
    } catch (err) {
        console.error("Error in removeCourse:", err);
        res.status(500).json({ message: "Server error while removing course." });
    }
}

async function getCurrectCourses(req, res) {
    const studentID = req.body.studentID;
    const student = await Student.findOne({ _id: studentID });
    if (!student) return res.status(400).json({ message: "Student does not exist!" });
    res.json({ "courses": student.currentCourses });
}

async function getPassedCourses(req, res) {
    const studentID = req.body.studentID;
    const student = await Student.findOne({ _id: studentID });
    if (!student) return res.status(400).json({ message: "Student does not exist!" });
    res.json({ "courses": student.coursesPassed });
}

async function getStudentProfile(req, res) {
    const studentID = req.body.studentID;
    const student = await Student.findOne({ _id: studentID });
    if (!student) return res.status(400).json({ message: "Student does not exist!" });
    updateCGPA(student._id);
    const data = student.toObject();
    data.password = undefined; // Exclude password from response
    res.json({ "student": data });
}

async function updateStudentProfile(req, res) {
    const studentID = req.body.studentID;
    const student = await Student.findOne({ _id: studentID });
    if (!student) return res.status(400).json({ message: "Student does not exist!" });
    let duplicate;
    if(req.body.rollNo && req.body.rollNo !== student.rollNo) duplicate = duplicate || await Student.findOne({ rollNo: req.body.rollNo });
    if(req.body.email && req.body.email !== student.email) duplicate = duplicate || await Student.findOne({ email: req.body.email });

    if(duplicate) return res.status(409).json({ message: "Student with this roll number or email already exists!" });

    if (req.body.name) student.name = req.body.name;
    if (req.body.department) student.department = req.body.department;
    if (req.body.rollNo) student.rollNo = req.body.rollNo;
    if (req.body.semester) student.semester = req.body.semester;
    if (req.body.email) student.email = req.body.email;
    if (req.body.cgpa) student.cgpa = req.body.cgpa;
    if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        student.password = hashedPassword;
    }
    await student.save();
    res.json({ "student": student });
}

async function updatePassword(req, res) {
    const studentID = req.body.studentID;
    const student = await Student.findOne({ _id: studentID });
    const { oldPassword, newPassword } = req.body;
    if (!student) return res.status(400).json({ message: "Student does not exist!" });

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect!" });

    if (newPassword === oldPassword) {
        return res.status(400).json({ message: "New password cannot be the same as old password!" });
    }
    if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        student.password = hashedPassword;
        await student.save();
        return res.json({ message: "Password updated successfully!" });
    }
    res.json({ "message": "No password provided!" });
}

async function getALLStudents(req, res) {
    try {
        const data = await Student.find();
        data.forEach(student => {
            student.password = undefined; // Remove sensitive data
            student.refreshToken = undefined; // Remove sensitive data
        });
        res.json({ "students": data });
    } catch (err) {
        console.error("Error in getALLStudents:", err);
        res.status(500).json({ message: "Server error while fetching all students." });
    }
}

async function updateCGPA(studentID) {
    const student = await Student.findOne({ _id: studentID });
    if (!student) return "Student does not exist!";
    let sum = 0, count = 0;
    for (const c of student.coursesPassed) {
        const course = await Course.findOne({ _id: c.course });
        if (course) {
            sum += (c.Grade * course.ch);
            count += course.ch;
        }
    }
    const newCGPA = count > 0 ? (sum / count) : null;
    student.cgpa = newCGPA ? Number(newCGPA.toFixed(2)) : null; // 2 decimal places optional
    await student.save();
}


module.exports = {
    addCourse,
    removeCourse,
    getCurrectCourses,
    getPassedCourses,
    getStudentProfile,
    updateStudentProfile,
    updatePassword,
    getALLStudents,
    updateCGPA
};

