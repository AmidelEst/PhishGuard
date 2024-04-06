// src/controllers/user.js

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
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
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
