// src/controllers/user.js

const User = require('../models/user');
const express = require('express');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401);
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

// 1) Register Rout
userRouter.post('/register', async (req, res) => {
	try {
		const { email, password } = req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.send({ success: false, message: 'User already exists' });
		}

		// Hash the password before saving the new user
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ email, password: hashedPassword });
		await newUser.save();

		res.status(201).send({
			success: true,
			message: 'User registered successfully',
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

// 2) Login Rout
userRouter.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email: email.trim().toLowerCase() });
		if (!user) {
			return res.status(401).send({
				success: false,
				message: 'User not found.',
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({
				success: false,
				message: 'Wrong password.',
			});
		}

		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '24h',
		});
		res.json({ success: true, token: token });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

// 3) logOut Rout

// Get user details (protected route)
userRouter.get('/details', authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });
		}

		res.json({
			success: true,
			email: user.email,
			// Include other safe user details here
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Error fetching user details',
		});
	}
});

module.exports = userRouter;
