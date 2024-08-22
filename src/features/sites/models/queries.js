//------------------------------------------------------//
// src\features\sites\models\queries.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queriesSchema = new Schema(
	{
		monitoredSites: { type: Schema.Types.ObjectId, ref: 'monitored_sites', required: true },
		submittedUrl: { type: String, required: true },
		isInSubscribedWhitelist: { type: String, enum: ['Yes', 'No'], required: true },
		cvScore: { type: String, enum: ['Yes', 'No'], required: true }
		// minHashScore: { type: String, enum: ['Yes', 'No'] },
		// overAllScore: { type: String, enum: ['Safe', 'Malicious'], required: true },
	},
	{ timestamps: true }
);

const Queries = mongoose.model('queries', queriesSchema);
module.exports = Queries;
