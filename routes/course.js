const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const ROLES=require('../config/roleList');
const verifyRoles=require('../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES.ADMIN,ROLES.FACULTY,ROLES.STUDENT),courseController.getAllCourses)
    .post(verifyRoles(ROLES.ADMIN),courseController.createCourse)
    .put(verifyRoles(ROLES.ADMIN),courseController.updateCourse);

router.route('/:id')
    .get(verifyRoles(ROLES.ADMIN,ROLES.FACULTY,ROLES.STUDENT),courseController.getCourse)
    .delete(verifyRoles(ROLES.ADMIN),courseController.deleteCourse);

module.exports = router;