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

router.post('/check_cv', async (req, res) => {
	const { whitelistUrl, submittedUrl } = req.body;

	try {
		// Fetch the new certificate for the submitted URL
		const newCertificate = await fetchSSLCertificate(submittedUrl);

		// Find the monitored site by its canonical URL (whitelist URL)
		const monitoredSite = await MonitoredSite.findOne({
			canonicalUrl: whitelistUrl
		}).populate('certificate');

		if (!monitoredSite || !monitoredSite.certificate) {
			return res.status(404).json({
				success: false,
				message: 'No certificate found for this monitored site.'
			});
		}
		console.log(monitoredSite.certificate, newCertificate);

		// Compare the stored certificate with the newly fetched certificate
		const certificatesComparisonResult = await compareCertificates(monitoredSite.certificate, newCertificate);

		if (!certificatesComparisonResult) {
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
			message: err.message
		});
	}
});
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

router.post('/new_query', async (req, res) => {
	const { canonicalUrl } = req.body;
	console.log('Canonical URL being queried:', canonicalUrl.canonicalUrl);
	try {
		// Find the monitored site by its canonical URL (whitelist URL)
		const monitoredSite = await MonitoredSite.findOne({
			canonicalUrl: canonicalUrl.canonicalUrl
		});
		if (!monitoredSite) {
			return res.status(404).json({
				success: false,
				message: 'monitored site Not found.'
			});
		}
		await storeNewQuery(
			monitoredSite,
			canonicalUrl.submittedURLCopy,
			canonicalUrl.isInSubscribedWhitelist,
			canonicalUrl.cvScore
		);
	} catch (err) {}
	return res.status(200).json({
		success: false,
		message: 'Low similarity score.'
	});
});

module.exports = router;
