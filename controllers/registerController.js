const Faculty = require('../model/Faculty');
const Student = require('../model/Student');
const ROLES = require('../config/roleList');
const bcrypt = require('bcrypt');


async function handle_new_user(req, res) {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required to register!" });
    }

    if (role === ROLES.FACULTY) {
        return handle_faculty(req, res);
    }

    if (role === ROLES.STUDENT) {
        return handle_student(req, res);
    }

    return res.status(400).json({ message: "Invalid role provided!" });
}

async function handle_student(req, res) {
    const { name, email, password, rollNo, semester, department } = req.body;

    const duplicateEmail = await Student.findOne({ email });
    if (duplicateEmail) {
        return res.status(409).json({ message: "Email address already exists!" });
    }

    const duplicateRoll = await Student.findOne({ rollNo });
    if (duplicateRoll) {
        return res.status(409).json({ message: "Roll number already exists!" });
    }

    try {
        const hash_password = await bcrypt.hash(password, 10);// salt = 10

        const new_user = await Student.create({
            name,
            email,
            password: hash_password,
            rollNo,
            semester,
            department
        });

        return res.status(201).json({ success: `New student '${name}' registered successfully!` });
    } catch (err) {
        return res.status(500).json({ message: `Error while registering: ${err.message}` });
    }
}

async function handle_faculty(req, res) {
    const { name, email, password, designation } = req.body;

    const duplicateEmail = await Faculty.findOne({ email });
    if (duplicateEmail) {
        return res.status(409).json({ "message": "Email address already exists!" });
    }

    try {
        const hash_password = await bcrypt.hash(password, 10);

        const new_user = await Faculty.create({
            name,
            email,
            password: hash_password,
            designation
        });

        return res.status(201).json({ success: `New faculty '${name}' registered successfully!` });
    } catch (err) {
        return res.status(500).json({ message: `Error while registering: ${err.message}` });
    }
}

module.exports = handle_new_user;
