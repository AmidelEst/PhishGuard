// src/models/users/adminUser
const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const adminUserSchema = new Schema(
	{
		email: { type: String, unique: true, required: true },
		password: { type: String, required: true }, // Remember to hash passwords before saving
		role: { type: String, default: 'admin' },
	},
	{ timestamps: true }
);

const AdminUser = mongoose.model('admin_users', adminUserSchema);
module.exports = AdminUser;
