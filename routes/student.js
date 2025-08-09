const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const ROLES = require('../config/roleList');
const verifyRoles = require('../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES.ADMIN, ROLES.FACULTY), studentController.getALLStudents);

router.route('/addCourse')
    .post(verifyRoles(ROLES.STUDENT, ROLES.ADMIN), studentController.addCourse);

router.route('/removeCourse')
    .put(verifyRoles(ROLES.FACULTY, ROLES.ADMIN), studentController.removeCourse);

router.route('/currentCourses')
    .get(verifyRoles(ROLES.STUDENT, ROLES.ADMIN, ROLES.FACULTY), studentController.getCurrectCourses);

router.route('/passedCourses')
    .get(verifyRoles(ROLES.STUDENT, ROLES.ADMIN, ROLES.FACULTY), studentController.getPassedCourses);

router.route('/profile')
    .get(verifyRoles(ROLES.STUDENT, ROLES.ADMIN), studentController.getStudentProfile)
    .put(verifyRoles(ROLES.ADMIN), studentController.updateStudentProfile);

router.route('/updatePassword')
    .put(verifyRoles(ROLES.STUDENT, ROLES.ADMIN), studentController.updatePassword);

router.route('/updateCGPA')
    .put(verifyRoles(ROLES.STUDENT, ROLES.ADMIN), studentController.updateCGPA);

module.exports = router;
