//------------------------------------------------------//
// src/features/sites/controllers/sites.js
const express = require('express');
const router = express.Router();
const MonitoredSite = require('../models/monitoredSite');
const { storeNewQuery } = require('../utils/queries/queries');

const {
	fetchAndHashSubmittedURL,
	fetchWhitelistedSites,
	compareMinHashes
} = require('../utils/cyber/similarityScoring');
const { compareCertificates, fetchSSLCertificate } = require('../utils/certificate/certificate');

//! stage 2: check CV
router.post('/check_cv', async (req, res) => {
	const { canonicalUrl, submittedUrl } = req.body;
	console.log(canonicalUrl + '\t' + submittedUrl);
	if (!canonicalUrl || !submittedUrl) {
		return res.status(400).json({
			success: false,
			message: 'Both canonicalUrl and submittedUrl are required.'
		});
	}

	try {
		// Fetch the new certificate for the submitted URL
		const newCertificate = await fetchSSLCertificate(submittedUrl);
		if (!newCertificate) {
			console.error('Failed to fetch SSL certificate for:', submittedUrl);
			return res.status(500).json({
				success: false,
				message: 'Could not fetch SSL certificate for the submitted URL.'
			});
		}

		// Find the monitored site by its canonical URL (whitelist URL)
		const monitoredSite = await MonitoredSite.findOne({
			canonicalUrl: canonicalUrl
		}).populate('certificate');
		console.log('Stored Certificate:', monitoredSite.certificate);

		if (!monitoredSite || !monitoredSite.certificate) {
			return res.status(404).json({
				success: false,
				message: 'No certificate found for this monitored site.'
			});
		}

		// console('Stored Certificate:', monitoredSite.certificate);
		// console('Fetched Certificate:', newCertificate);

		// Compare the stored certificate with the newly fetched certificate
		const certificatesComparisonResult = await compareCertificates(monitoredSite.certificate, newCertificate);

		if (certificatesComparisonResult === undefined || certificatesComparisonResult === null) {
			console.error('Certificate comparison failed.');
			return res.status(500).json({
				success: false,
				message: 'Failed to process submitted URL.'
			});
		}

		// Return response based on certificate comparison result
		if (certificatesComparisonResult) {
			return res.status(200).json({
				success: true,
				message: 'Submitted link is CV safe.'
			});
		} else {
			return res.status(200).json({
				success: false,
				message: 'Phishing Attempt! Do not enter the site!'
			});
		}
	} catch (err) {
		console.error('Error processing certificates:', err);
		return res.status(500).json({
			success: false,
			message: 'An error occurred while processing the certificates.'
		});
	}
});

//^  new_query
router.post('/new_query', async (req, res) => {
	const { canonicalUrl, submittedURLCopy, isInSubscribedWhitelist, cvScore } = req.body;
	console.log('Canonical URL being queried:', canonicalUrl.canonicalUrl);
	try {
		// Find the monitored site by its canonical URL (whitelist URL)
		const monitoredSite = await MonitoredSite.findOne({
			canonicalUrl,
			submittedURLCopy,
			isInSubscribedWhitelist,
			cvScore
		});
		if (!monitoredSite) {
			return res.status(404).json({
				success: false,
				message: 'monitored site Not found.'
			});
		}
		await storeNewQuery(monitoredSite, canonicalUrl, submittedURLCopy, isInSubscribedWhitelist, cvScore);
	} catch (err) {}
	return res.status(200).json({
		success: false,
		message: 'Low similarity score.'
	});
});
//^  check_url
router.post('/check_url', async (req, res) => {
	const { url } = req.body;

	// Fetch and hash the submitted URL
	const submittedResult = await fetchAndHashSubmittedURL(url);
	if (!submittedResult) {
		return res.status(500).json({ success: false, message: 'Failed to process submitted URL.' });
	}

	// Fetch the whitelisted sites
	const whitelistedSites = await fetchWhitelistedSites();
	if (!whitelistedSites || whitelistedSites.length === 0) {
		return res.status(500).json({ success: false, message: 'No whitelisted sites found.' });
	}

	// Compare the MinHash signatures
	const { similarity, mostSimilarSite } = compareMinHashes(submittedResult, whitelistedSites);

	// Determine response based on similarity score
	const similarityThreshold = 0.8;

	if (similarity > similarityThreshold) {
		return res.status(200).json({
			success: true,
			message: `High similarity of ${similarity},\nwith site: ${mostSimilarSite.siteName}\n`,
			similarity
		});
	} else {
		return res.status(200).json({
			success: false,
			message: 'Low similarity score.',
			similarity
		});
	}
});

module.exports = router;
