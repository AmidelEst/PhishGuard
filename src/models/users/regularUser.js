// src/models/users/regularUser.js
const mongoose = require('mongoose');


const regularUserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' },
		subscribedAdmin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'AdminUser',
			required: true,
		},
		securityLevel: {
			type: String,
			enum: ['Low', 'Medium', 'High', 'Highest'],
			default: 'Medium',
		},
	},
	{ timestamps: true }
);

const RegularUser = mongoose.model('regular_users', regularUserSchema);

module.exports = RegularUser;
