const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, updatePassword } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize('admin', 'teacher'), getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/me/password', updatePassword);

module.exports = router;
