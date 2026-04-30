const express = require('express');
const router = express.Router();
const { uploadMiddleware, uploadFile } = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, uploadFile);

module.exports = router;
