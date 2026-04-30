const express = require('express');
const router = express.Router();
const { getResults, submitResult, getResult } = require('../controllers/result.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getResults);
router.get('/:id', getResult);
router.post('/', submitResult);

module.exports = router;
