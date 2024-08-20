// src/models/reports/securityReport.js;
const mongoose = require('mongoose');

const securityReportSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'regular_users', required: true },
	securityLevel: { type: String, enum: ['basic', 'medium', 'high'], default: 'Medium', required: true },
	whitelistId: { type: Schema.Types.ObjectId, ref: 'whitelists', required: true },
	queries: [{ type: Schema.Types.ObjectId, ref: 'queries', required: true }],
	timestamp: { type: Date, default: Date.now }
});

const SecurityReport = mongoose.model('security_reports', securityReportSchema);

module.exports = SecurityReport;
