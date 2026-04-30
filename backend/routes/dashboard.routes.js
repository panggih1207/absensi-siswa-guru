const express = require('express');
const router = express.Router();
const { getStats, getLeaderboard } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
