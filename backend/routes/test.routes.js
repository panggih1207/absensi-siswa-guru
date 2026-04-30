const express = require('express');
const router = express.Router();
const { getTests, getTest, createTest, updateTest, deleteTest } = require('../controllers/test.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getTests);
router.get('/:id', getTest);
router.post('/', authorize('admin', 'teacher'), createTest);
router.put('/:id', authorize('admin', 'teacher'), updateTest);
router.delete('/:id', authorize('admin', 'teacher'), deleteTest);

module.exports = router;
