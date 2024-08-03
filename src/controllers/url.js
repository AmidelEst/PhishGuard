// src/controllers/url.js
const express = require('express');
const router = express.Router();

const {
	fetchAndHashSubmittedURL,
	fetchWhitelistedSites,
	compareMinHashes,
} = require('../utils/similarityScoring');

router.post('/check_url', async (req, res) => {
	const { url } = req.body;

	// Fetch and hash the submitted URL
	const submittedResult = await fetchAndHashSubmittedURL(url);
	if (!submittedResult) {
		return res
			.status(500)
			.json({ success: false, message: 'Failed to process submitted URL.' });
	}

	// Fetch the whitelisted sites
	const whitelistedSites = await fetchWhitelistedSites();
	if (!whitelistedSites || whitelistedSites.length === 0) {
		return res
			.status(500)
			.json({ success: false, message: 'No whitelisted sites found.' });
	}

	// Compare the MinHash signatures
	const { similarity, mostSimilarSite } = compareMinHashes(
		submittedResult,
		whitelistedSites
	);

	// Determine response based on similarity score
	const similarityThreshold = 0.8; // Define your own threshold value
	if (similarity > similarityThreshold) {
		return res.status(200).json({
			success: true,
			message: `High similarity of ${similarity},\nwith site: ${mostSimilarSite.siteName}\n`,
			similarity,
		});
	} else {
		return res.status(200).json({
			success: false,
			message: 'Low similarity score.',
			similarity,
		});
	}
});

module.exports = router;
