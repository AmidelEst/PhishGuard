// src\features\sites\utils\urls\url.js

// Utility function to normalize a URL
function normalizeUrl(url) {
	try {
		lowerUrl = url.toLowerCase();
		console.error(lowerUrl);
		const parsedUrl = new URL(lowerUrl);
		return parsedUrl.origin + parsedUrl.pathname.replace(/\/+$/, ''); // Removes trailing slashes
	} catch (error) {
		console.error('Invalid URL:', error.message);
		return null;
	}
}

// Utility function to generate a regex pattern for URL variations
function generateUrlPattern(canonicalUrl) {
	try {
		// Example: Create a regex pattern to match various subdomains and paths
		const { hostname } = new URL(canonicalUrl);
		const pattern = `^https://(www\.)?${hostname.replace('.', '\\.')}.*$`;
		return pattern;
	} catch (error) {
		console.error('Failed to generate URL pattern:', error.message);
		return null;
	}
}
module.exports = {
	normalizeUrl,
	generateUrlPattern,
};
