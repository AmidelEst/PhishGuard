// src/routes/userRoutes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /users
router.get('/', userController.getUsers);
// Register route
router.post('/register', userController.register);

// Login route
router.post('/login', userController.login);
module.exports = router;
