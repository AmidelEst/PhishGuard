// src/controllers/user.js

const express = require('express');
const router = express.Router();

const User = require('../models/user');
const mongoose = require('mongoose');

// hashing tools
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).send({ message: 'No token provided' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).send({ message: 'Invalid token' });
	}
};

// User registration
router.post('/register', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check for existing user
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).send({ message: 'User already exists' });
		}

		// Hash password
		const saltRounds = 10;
		const hash = await bcrypt.hash(password, saltRounds);

		// Create new user
		const newUser = new User({
			_id: new mongoose.Types.ObjectId(),
			email,
			password: hash,
		});

		await newUser.save();
		res.status(201).send({ message: 'User registered successfully' });
	} catch (err) {
		handleErrors(err, res);
	}
});

// User login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(401)
				.send({ message: 'Authentication failed. User not found.' });
		}

		// Compare password hashes
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ message: 'Authentication failed' });
		}

		// Generate and set token
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '24h',
		});
		res.cookie('token', token, {
			httpOnly: true,
			secure: true, // Use secure cookies only in HTTPS environments
			maxAge: 24 * 60 * 60 * 1000, // Expires in 24 hours
			sameSite: 'strict',
		});

		res.status(200).json({ success: true, token: 'JWT ' + token });
	} catch (err) {
		handleErrors(err, res);
	}
});

// Get user details (protected route)
router.get('/details', authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).send({ message: 'User not found' });
		}

		// Return safe user details (exclude password)
		res.json({
			success: true,
			email: user.email,
			// Add other relevant fields without exposing sensitive information
		});
	} catch (err) {
		handleErrors(err, res);
	}
});

module.exports = router;
