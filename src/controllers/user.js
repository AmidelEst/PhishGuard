// src/controllers/user.js

<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Environment variables for better security and flexibility
const saltRounds = process.env.SALT_ROUNDS || 10; // Default to 10 if not specified

// Authentication middleware
const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ message: 'Invalid token' });
	}
};

// User registration
router.post('/register', async (req, res) => {
	const { email, password } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: 'User already exists' });
		}

		const hash = await bcrypt.hash(password, parseInt(saltRounds));
		const newUser = new User({ email, password: hash });
		await newUser.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch (err) {
		res.status(500).json({ message: 'Error registering user' });
	}
});

// User login
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(401)
				.json({ message: 'Authentication failed. User not found.' });
=======
// user database
const userDB = require('../models/users');
const express = require('express');
const userRouter = express.Router();
// hashing tools
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Route to register a new user
userRouter.post('/register', async (req, res) => {
	try {
		//
		console.log(`${req.method}:${req.url}`);
		//
		const { email, password } = req.body;

		const existingUser = await userDB.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.send({ success: false, message: 'User already exists' });
		}

		// Directly create the new user with the provided password; pre-save middleware will handle hashing
		const newUser = new userDB({ email, password });
		await newUser.save();

		res.status(201).send({
			success: true,
			message: 'User registered successfully',
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

// Route to login a user
userRouter.post('/login', async (req, res) => {
	try {
		//
		console.log(`${req.method}:${req.url}`);
		//
		//deconstruct
		const { email, password } = req.body;

		const user = await userDB.findOne({ email });
		if (!user) {
			return res.status(401).send({
				success: false,
				message: 'Authentication failed. User not found.',
			});
>>>>>>> check1
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
<<<<<<< HEAD
			return res.status(401).json({ message: 'Authentication failed' });
		}

		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '24h',
		});
		res.cookie('token', token, {
			httpOnly: true,
			secure: true,
			maxAge: 86400000,
			sameSite: 'strict',
		});
		res.status(200).json({ success: true, token: 'JWT ' + token });
	} catch (err) {
		res.status(500).json({ message: 'Error logging in' });
	}
});

// Get user details (protected route)
router.get('/details', authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({
			success: true,
			email: user.email,
			// Other safe user details
		});
	} catch (err) {
		res.status(500).json({ message: 'Error fetching user details' });
	}
});

module.exports = router;
=======
			return res.status(401).send({
				success: false,
				message: 'Authentication failed. Wrong password.',
			});
		}
		// assigning a token
		const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
			expiresIn: '24h',
		});
		res.json({ success: true, token: 'JWT ' + token });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

module.exports = userRouter;
>>>>>>> check1
