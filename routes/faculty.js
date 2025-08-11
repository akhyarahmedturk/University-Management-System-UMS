const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const ROLES = require('../config/roleList');
const verifyRoles = require('../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), facultyController.getFaculty)
    .post(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), facultyController.addCourse)
    .delete(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), facultyController.removeCourse)
    .put(verifyRoles(ROLES.ADMIN), facultyController.updateFacultyProfile);

router.route('/assignGrade')
    .put(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), facultyController.assignGrade);

router.route('/faculties')
    .get(verifyRoles(ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN), facultyController.getFaculties);

router.route('/courses')
    .get(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), facultyController.getCourses);

router.route('/updatePassword')
    .put(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), facultyController.updatePassword);


module.exports = router;