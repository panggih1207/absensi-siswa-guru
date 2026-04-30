const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/question.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getQuestions);
router.post('/', authorize('admin', 'teacher'), createQuestion);
router.put('/:id', authorize('admin', 'teacher'), updateQuestion);
router.delete('/:id', authorize('admin', 'teacher'), deleteQuestion);

module.exports = router;
