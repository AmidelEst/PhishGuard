//------------------------------------------------------//
// extension/public/js/helperFunctions/urlUtils.js
//
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

// // Utility function to normalize a URL
// export function normalizeUrl(url) {
// 	try {
// 		const lowerUrl = url.toLowerCase();
// 		console.log(lowerUrl);
// 		const parsedUrl = new URL(lowerUrl);
// 		return parsedUrl.origin;
// 	} catch (error) {
// 		console.log('Invalid URL:', error.message);
// 		return null;
// 	}
// }
// // Format submitted URL with the correct prefix if missing
// export const formatSubmittedUrl = url => {
// 	if (!/^https?:\/\//i.test(url)) {
// 		url = /^www\./i.test(url) ? `https://${url}` : `https://www.${url}`;
// 	}
// 	return url;
// };

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


// Adjust isUrlInWhitelist to handle an array of strings (URLs)
export function isUrlInWhitelist(submittedUrl, whitelist) {
	console.log('SubmittedUrl:' + submittedUrl);
	if (!submittedUrl) {
		return { success: false, message: 'Invalid URL submitted' };
	}
	// Loop through the whitelist and check for a direct match
	for (const url of whitelist) {
		console.log('WhitelistUrl:' + url);
		if (url.includes(submittedUrl) || submittedUrl.includes(url)) {
			return { success: true, canonicalUrl: url };
		}
	}
	return { success: false, message: 'URL not found in whitelist' };
}
