const mongoose = require('mongoose');

// Define the schema for the admin
const adminSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	sitesToMonitor: [
		{
			type: String,
			trim: true,
		},
	],
});

module.exports = mongoose.model('admin', adminSchema);
