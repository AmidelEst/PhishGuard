// src/models/users.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

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
	// Additional fields can be added here
});

// Password hashing middleware
userSchema.pre('save', function (next) {
	let user = this;

	// Only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// Generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
		if (err) return next(err);

		// Hash the password using the salt
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err);

			// Replace the plain text password with the hashed one
			user.password = hash;
			next();
		});
	});
});

const users = mongoose.model('users', userSchema, 'users');

module.exports = users;
