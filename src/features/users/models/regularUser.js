//------------------------------------------------------//
// src/models/users/regularUser.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regularUserSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, default: 'user' },
		subscribedWhitelist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Whitelists',
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
