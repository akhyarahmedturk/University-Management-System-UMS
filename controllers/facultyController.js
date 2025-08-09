const mongoose = require('mongoose');
const Course = require('../model/Course');
const Student = require('../model/Student');
const Faculty = require('../model/Faculty');
const bcrypt = require('bcrypt');
const updateCGPA = require('./studentController').updateCGPA;
const ObjectId = mongoose.Types.ObjectId;

async function addCourse(req, res) {
    let courseID = req.body.courseID;
    let facultyID = req.body.facultyID;
    if (!courseID || !facultyID) return res.status(400).json({ message: "Some data missing!" });
    courseID = ObjectId.createFromHexString(courseID);
    facultyID = ObjectId.createFromHexString(facultyID);

    let faculty = await Faculty.findById(facultyID);
    if (!faculty) return res.status(400).json({ message: "Faculty does not exist!" });

    let course = await Course.findOne({ _id: courseID });
    if (!course) return res.status(400).json({ message: "Course does not exist!" });

    const duplicate = course.faculties?.some(facId => facId.equals(facultyID));
    if (duplicate) return res.status(400).json({ message: "This Faculty already exists in this course!" });

    course.faculties.push(faculty._id);
    faculty.courses.push(course._id);
    await course.save();
    await faculty.save();

    res.status(200).json({ message: "Faculty added to course successfully!" });
}


async function removeCourse(req, res) {
    let courseID = req.body.courseID;
    let facultyID = req.body.facultyID;
    if (!courseID || !facultyID) return res.status(400).json({ message: "Some data missing!" });
    courseID = ObjectId.createFromHexString(courseID);
    facultyID = ObjectId.createFromHexString(facultyID);

    let faculty = await Faculty.findById(facultyID);
    if (!faculty) return res.status(400).json({ message: "Faculty does not exist!" });

    let course = await Course.findOne({ _id: courseID });
    if (!course) return res.status(400).json({ message: "Course does not exist!" });

    const index = course.faculties?.findIndex(facId => facId.equals(facultyID));
    if (index === -1 || index === undefined) {
        return res.status(400).json({ message: "Faculty does not exist in this course!" });
    }
    // check if any student enrolled in this course with this faculty
    const students = await Student.find({ "currentCourses.course": course._id, "currentCourses.faculty": facultyID });
    if (students.length > 0) {
        return res.status(400).json({ message: "Cannot remove faculty from course while students are enrolled\n Assign grades to students first!" });
    }

    course.faculties.splice(index, 1);

    const facultyIndex = faculty.courses?.findIndex(c => c.equals(course._id));
    if (facultyIndex !== -1) {
        faculty.courses.splice(facultyIndex, 1);
    }
    await course.save();
    await faculty.save();

    res.status(200).json({ message: "Faculty removed from course successfully!" });
}

async function assignGrade(req, res) {
    let { facultyID, studentID, grade, courseID } = req.body;
    grade = Number(grade);
    if (!facultyID || !studentID || !courseID || grade === undefined) {
        return res.status(400).json({ message: "Some data missing!" });
    }
    facultyID = ObjectId.createFromHexString(facultyID);
    studentID = ObjectId.createFromHexString(studentID);
    courseID = ObjectId.createFromHexString(courseID);

    const student = await Student.findOne({ _id: studentID });
    if (!student) return res.status(400).json({ message: "Student does not exist!" });

    const course = await Course.findOne({ _id: courseID });
    if (!course) return res.status(400).json({ message: "Course does not exist!" });

    const courseIndex = student.currentCourses?.findIndex(c =>
        c.course.equals(course._id) && c.faculty.equals(facultyID)
    );

    if (courseIndex === -1 || courseIndex === undefined) {
        return res.status(400).json({ message: "Student is not enrolled in this course with this faculty!" });
    }

    // Check if course already passed
    const passedIndex = student.coursesPassed?.findIndex(c => c.course.equals(course._id));
    if (passedIndex !== -1) {
        // Course already passed, take max grade
        student.coursesPassed[passedIndex].Grade = Math.max(student.coursesPassed[passedIndex].Grade, grade);
    } else {
        // New passed course
        student.coursesPassed.push({
            course: course._id,
            Grade: grade
        });
    }

    // Remove from currentCourses
    student.currentCourses.splice(courseIndex, 1);

    await student.save();
    updateCGPA(student._id);
    return res.status(200).json({ message: "Grade assigned successfully!" });

}

async function getFaculties(req, res) {
    const data = await Faculty.find();
    data.forEach(faculty => {
        faculty.password = undefined; // Remove sensitive data
        faculty.refreshToken = undefined; // Remove sensitive data
    });
    res.json({ "faculty": data });
}

async function getCourses(req, res) {
    const facultyId = req.body.facultyID; // Assuming req.faculty is set by verify_JWT middleware
    const data = await Faculty.findById(facultyId);
    res.json({ "courses": data.courses });
}

async function getFaculty(req, res) {
    const facultyId = req.body.facultyID;
    const data = await Faculty.findById(facultyId);
    if (!data) {
        return res.status(404).json({ message: "Faculty not found" });
    }
    data.password = undefined; // Remove sensitive data
    data.refreshToken = undefined; // Remove sensitive data
    res.json({ "faculty": data });
}

async function updatePassword(req, res) {
    const facultyID = req.body.facultyID;
    const faculty = await Faculty.findOne({ _id: facultyID });
    const { oldPassword, newPassword } = req.body;
    if (!faculty) return res.status(400).json({ message: "Faculty does not exist!" });

    const isMatch = await bcrypt.compare(oldPassword, faculty.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect!" });

    if (newPassword === oldPassword) {
        return res.status(400).json({ message: "New password cannot be the same as old password!" });
    }
    if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        faculty.password = hashedPassword;
        await faculty.save();
        return res.json({ message: "Password updated successfully!" });
    }
    res.json({ "message": "No password provided!" });
}

module.exports = {
    addCourse,
    removeCourse,
    assignGrade,
    getFaculties,
    getCourses,
    updatePassword,
    getFaculty
};