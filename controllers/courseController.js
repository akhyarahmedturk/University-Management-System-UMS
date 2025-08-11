const mongoose = require('mongoose');
const Course = require('../model/Course');
const Student = require('../model/Student');
const Faculty = require('../model/Faculty');
const ObjectId = mongoose.Types.ObjectId;


async function getAllCourses(req, res) {
    const data = await Course.find();
    res.json({ "courses": data });
}

async function getCourse(req, res) {
    const code = req.params.id;
    const course = await Course.findOne({ code });
    if (!course);
    if (course) {
        res.json(course);
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}

async function createCourse(req, res) {
    const { name, code, ch } = req.body;
    if (!name || !code || !ch) {
        return res.status(400).json({ message: "Some data missing!" });
    }
    const duplicate = await Course.findOne({ code });
    if (duplicate) return res.status(409).json({ message: "This course already exist's!" });
    try {
        //make ch integer
        if(ch) ch = parseInt(ch);
        const newCourse = await Course.create({
            name, code, ch
        });
        res.status(201).json(newCourse);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating Course", error: err.message });
    }
}


async function updateCourse(req, res) {
    const courseID = req.body.courseID;
    const course = await Course.findOne({ _id:courseID });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    let duplicate;
    if(req.body.code && req.body.code !== course.code) {
        duplicate = await Course.findOne({ code: req.body.code });
        if (duplicate) {
            return res.status(409).json({ message: "Course code already exists" });
        }
        course.code = req.body.code;
    }
    if (req.body.name) course.name = req.body.name;
    if (req.body.ch) {
        course.ch = parseInt(req.body.ch);
    }
    await course.save();
    res.status(200).json(course);
}


async function deleteCourse(req, res) {
    const code = req.params.id;
    const course = await Course.findOne({ code });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const result = await Course.deleteOne({ code });
    res.status(200).json({ message: "Course deleted successfully", deleted_count: result });
}

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
};