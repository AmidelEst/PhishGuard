
const MonitoredSite = require('../../models/monitoredSite');
const { compressAndHashHTML } = require('./urlToHash');

// Fetch and hash the submitted URL
async function fetchAndHashSubmittedURL(url) {
	const result = await compressAndHashHTML(url);
	if (!result) {
		// console.error(`Failed to compress and hash content for ${url}`);
		return null;
	}
	// console.log(`Submitted URL: ${url}, MinHash: ${result.minHash}`);
	return result;
}

// Fetch all whitelisted sites from the database
async function fetchWhitelistedSites() {
	try {
		const sites = await MonitoredSite.find({});
		// console.log(
		// 	`Whitelisted Sites: ${JSON.stringify(
		// 		sites.map((site) => ({ url: site.url })), //, minHash: site.minHash
		// 		null,
		// 		3
		// 	)}`
		// );
		return sites;
	} catch (error) {
		console.error('Error fetching whitelisted sites:', error);
		return [];
	}
}

// Compare MinHash signatures to find the most similar site
function compareMinHashes(submitted, whitelistedSites) {
	let highestSimilarity = 0;
	let mostSimilarSite = null;

	for (const site of whitelistedSites) {
		if (!site.minHash) {
			console.error(`MinHash is missing for site: ${site.url}`);
			continue;
		}

		const similarity = jaccardSimilarity(submitted.minHash, site.minHash);
		console.log(
			`Comparing ${submitted.url} MinHash with Whitelisted ${site.siteName} , Similarity: ${similarity}`
		);

		if (similarity > highestSimilarity) {
			highestSimilarity = similarity;
			mostSimilarSite = site;
		}
	}

	return { similarity: highestSimilarity, mostSimilarSite };
}

// Calculate Jaccard similarity between two MinHash signatures
function jaccardSimilarity(signature1, signature2) {
	const intersection = signature1.reduce(
		(count, hash, index) => count + (hash === signature2[index]),
		0
	);
	return intersection / signature1.length;
}

module.exports = {
	fetchAndHashSubmittedURL,
	fetchWhitelistedSites,
	compareMinHashes,
};
