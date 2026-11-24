const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.post('/register', requireFields(['name', 'email', 'password']), register);
router.post('/login', requireFields(['email', 'password']), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
