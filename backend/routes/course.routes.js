const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollStudent } = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', authorize('admin', 'teacher'), createCourse);
router.put('/:id', authorize('admin', 'teacher'), updateCourse);
router.delete('/:id', authorize('admin', 'teacher'), deleteCourse);
router.post('/:id/enroll', enrollStudent);

module.exports = router;
