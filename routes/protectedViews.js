const express = require('express');
const path = require('path');
const router = express.Router();
const ROLES = require('../config/roleList');

const ROLE_MAP = {
    student: ['student-dashboard.html', 'student-academic-history.html', 'student-profile.html', 'student-enroll.html', 'student-courses.html'],
    admin: ['admin-dashboard.html', 'admin-manage-students.html', 'admin-statistics.html', 'admin-manage-courses.html', 'admin-manage-faculty.html'],
    faculty: ['faculty-dashboard.html', 'faculty-assign-course.html', 'faculty-profile.html', 'faculty-active-students.html', 'faculty-assign-grades.html']
};

router.get('/:viewName', (req, res) => {
    const userRole = req.body.role;
    const viewName = req.params.viewName;

    let allowedFiles = [];
    if (userRole === ROLES.STUDENT) allowedFiles = ROLE_MAP.student;
    else if (userRole === ROLES.ADMIN) allowedFiles = ROLE_MAP.admin;
    else if (userRole === ROLES.FACULTY) allowedFiles = ROLE_MAP.faculty;

    if (allowedFiles.includes(viewName)) {
        const filePath = path.join(__dirname, '..', 'views', viewName);
        return res.sendFile(filePath);
    }

    return res.status(403).send('Forbidden: You are not allowed to view this page.');
});

module.exports = router;
