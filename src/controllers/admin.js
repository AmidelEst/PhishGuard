// src/controllers/adminController.js

// express and Router
const express = require('express');
const adminRouter = express.Router();

// admin database
const Admin = require('../models/admin');

// hashing tools
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Route to register a new user
adminRouter.post('/admin/register', async (req, res) => {
	try {
		const { email, password } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.send({ success: false, message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ ...req.body, password: hashedPassword });
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
adminRouter.post('/admin/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).send({
				success: false,
				message: 'Authentication failed. User not found.',
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({
				success: false,
				message: 'Authentication failed. Wrong password.',
			});
		}

		const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
			expiresIn: '24h',
		});
		res.json({ success: true, token: 'JWT ' + token });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

module.exports = adminRouter;
