// src/models/reports/securityReport.js;
const mongoose = require('mongoose');

const securityReportSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'RegularUser',required: true,},
	timestamp: {type: Date,default: Date.now,},
	applicationUsage: {type: String, // Could be detailed metrics as a JSON string or an object
		required: true,
	},
	flaggedUrls: {type: [String],required: false,},
});

const SecurityReport = mongoose.model('security_reports', securityReportSchema);

module.exports = SecurityReport;
