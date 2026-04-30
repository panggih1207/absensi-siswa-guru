const express = require('express');
const router = express.Router();
const {
  getTrainings, getTraining, createTraining, updateTraining, deleteTraining, rateTraining, updateProgress
} = require('../controllers/training.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getTrainings);
router.get('/:id', getTraining);
router.post('/', authorize('admin', 'teacher'), createTraining);
router.put('/:id', authorize('admin', 'teacher'), updateTraining);
router.delete('/:id', authorize('admin', 'teacher'), deleteTraining);
router.post('/:id/rate', rateTraining);
router.post('/:id/progress', updateProgress);

module.exports = router;
