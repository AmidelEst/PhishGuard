// src/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
});

module.exports = mongoose.model('User', userSchema);
