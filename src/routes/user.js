//src/routes/user

const express = require('express');
const router = express.Router();

const {
	userLogin,
	userRegister,
	updateUser,
} = require('../controllers/user');

router.post('/register', userRegister);
router.post('/login', userLogin);
// router.patch('/:email', updateUser);
// router.delete('/:email', deleteUser);

module.exports = router;
