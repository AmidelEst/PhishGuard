//------------------------------------------------------//
// extension/public/js/helperFunctions/urlUtils.js
export const extractBaseUrl = url => {
	try {
		const { hostname } = new URL(url);
		// Remove 'www.' if it exists at the start of the hostname
		return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
	} catch (e) {
		console.error('Invalid URL provided:', e);
		return null;
	}
};

export function formatAndNormalizeUrl(url) {
	try {
		// Format the URL to ensure it has the correct prefix
		if (!/^https?:\/\//i.test(url)) {
			url = /^www\./i.test(url) ? `https://${url}` : `https://www.${url}`;
		}

		// Convert URL to lowercase and normalize it
		const lowerUrl = url.toLowerCase();
		const parsedUrl = new URL(lowerUrl);

		// Return the origin of the parsed URL (protocol + hostname + port if any)
		return parsedUrl.origin;
	} catch (error) {
		console.log('Invalid URL:', error.message);
		return null;
	}
}
//&
export function isUrlInWhitelist(submittedUrl, whitelist) {
	console.log('SubmittedUrl:' + submittedUrl);

	if (!submittedUrl) {
		return { success: false, message: 'Invalid URL submitted' };
	}

	// Normalize the submitted URL by removing 'www' and ensuring consistent format
	const normalizedSubmittedUrl = normalizeUrl(submittedUrl);

	// Loop through the whitelist and check for a match
	for (const url of whitelist) {
		// console.log('WhitelistUrl:' + url);

		// Normalize the whitelist URL
		const normalizedWhitelistUrl = normalizeUrl(url);

		// Check if the submitted URL matches or contains the whitelist URL (or vice versa)
		if (
			normalizedSubmittedUrl.startsWith(normalizedWhitelistUrl) ||
			normalizedWhitelistUrl.startsWith(normalizedSubmittedUrl)
		) {
			return { success: true, canonicalUrl: url };
		}
	}

	return { success: false, message: 'URL not found in whitelist' };
}

//! Helper function to normalize URLs
function normalizeUrl(url) {
	try {
		const parsedUrl = new URL(url);

		// Remove 'www' from the hostname, if present
		const normalizedHostname = parsedUrl.hostname.replace(/^www\./, '');

		// Reconstruct the normalized URL
		return `${parsedUrl.protocol}//${normalizedHostname}${parsedUrl.pathname}`;
	} catch (e) {
		console.error('Invalid URL:', url);
		return url; // Return the original URL if it can't be parsed
	}
}
