// src/models/reports/adminReport
const mongoose = require('mongoose');

const adminReportSchema = new mongoose.Schema({
	adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
	timestamp: { type: Date, default: Date.now },
	urlSearchData: [
		{
			url: String,
			searchCount: Number,
			averageScore: Number,
		},
	],
});

const AdminReport = mongoose.model('admin_reports', adminReportSchema);

module.exports = AdminReport;
