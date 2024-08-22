//------------------------------------------------------//
// src/models/users/regularUser.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
const sanitize = require('mongo-sanitize'); // Sanitize user inputs
const dotenv = require('dotenv');
dotenv.config();

const regularUserSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: function (v) {
					// Basic email format validation
					return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
				},
				message: props => `${props.value} is not a valid email!`
			}
		},
		password: {
			type: String,
			required: true
		},
		role: {
			type: String,
			default: 'user',
			enum: ['user', 'admin', 'superadmin'] // Enforce strict role values
		},
		subscribedWhitelist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Whitelists',
			required: true
		},
		securityLevel: {
			type: String,
			enum: ['basic', 'medium', 'high'],
			default: 'medium', // Fix capitalization to be consistent
			required: true
		}
	},
	{ timestamps: true }
);

// Pre-save hook to hash password before saving user
regularUserSchema.pre('save', async function (next) {
	const user = this;

	if (user.isModified('email')) {
		user.email = user.email.trim().toLowerCase();
	}

	// Hash password only if the password has been modified or is new
	if (user.isModified('password')) {
		try {
			// Hash the password with bcrypt
			const saltRounds = parseInt(process.env.SALT_ROUNDS || 10);
			user.password = bcrypt.hash(user.password, saltRounds);
		} catch (error) {
			return next(error);
		}
	}
	next();
});

// Static method to authenticate user
regularUserSchema.statics.authenticate = async function (email, password) {
	// Sanitize input
	email = sanitize(email);

	// Find user by email
	const user = await this.findOne({ email }).exec();
	if (!user) {
		throw new Error('User not found');
	}

	// Compare password
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Incorrect password');
	}

	return user;
};

// Apply schema-level input sanitization
regularUserSchema.methods.sanitizeInput = function (input) {
	return sanitize(input);
};

const RegularUser = mongoose.model('regular_users', regularUserSchema);

module.exports = RegularUser;
