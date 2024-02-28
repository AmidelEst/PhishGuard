// src/controllers/userController.js

const User = require('../models/user');
const express = require('express');
const userRouter = express.Router();
const mongoose = require('mongoose');

// hashing tools
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
	userRegister: async (req, res) => {
		try {
			const { email, password } = req.body;
			// 1. register error - email already exists
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return res
					.status(409)
					.send({ success: false, message: 'User already exists' });
			}
			// hash salt
			const hash = await bcrypt.hash(password, 10);
			// finally, create new user
			const newUser = new User({
				_id: new mongoose.Types.ObjectId(),
				email,
				password: hash,
			});

			await newUser.save().then((result) => {
				console.log(result);
			});

			res.status(201).send({
				success: true,
				message: 'User registered successfully',
			});
		} catch (error) {
			res.status(500).send({ success: false, message: error.message });
		}
	},
	userLogin: async (req, res) => {
		try {
			//deconstruct
			const { email, password } = req.body;

			const user = await User.findOne({ email });
			//  login error 1 - email
			if (!user) {
				return res.status(401).send({
					success: false,
					message: 'Authentication failed. User not found.',
				});
			}
			// login error 2 -  Password
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(401).send({
					success: false,
					message: 'Authentication failed',
				});
			}
			// assigning a token
			const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
				expiresIn: '24h',
			});

			// Set the token in a cookie
			res.cookie('token', token, {
				httpOnly: true, // Makes the cookie inaccessible to the client-side JS (important for security - prevents XSS attacks)
				secure: process.env.NODE_ENV === 'production', // In production, set secure to true to send the cookie over HTTPS only
				maxAge: 24 * 60 * 60 * 1000, // Set the cookie to expire in 24 hours
				sameSite: 'strict', // Controls whether the cookie is sent in cross-site requests
			});
			return res
				.status(200)
				.json({ success: true, token: 'JWT ' + token });
		} catch (error) {
			res.status(500).send({ success: false, message: error.message });
		}
	},
	// updateUser: (req, res) => {
	// 	const emailID = req.params.emailID;

	// 	res.status(200).json({
	// 		message: `update user ${emailID}`,
	// 	});
	// },
	// deleteUser: (req, res) => {
	// 	const emailID = req.params.emailID;

	// 	res.status(200).json({
	// 		message: `deleted user ${emailID}`,
	// 	});
	// },
};
