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
// Format submitted URL with the correct prefix if missing
export const formatSubmittedUrl = url => {
	if (!/^https?:\/\//i.test(url)) {
		url = /^www\./i.test(url) ? `https://${url}` : `https://www.${url}`;
	}
	return url;
};

// Adjust isUrlInWhitelist to handle an array of strings (URLs)
export function isUrlInWhitelist(submittedUrl, whitelist) {
	// if (!Array.isArray(whitelist)) {
	// 	// Check that the whitelist is an array of strings
	// 	console.error('Invalid whitelist structure:', whitelist);
	// 	return { success: false, message: 'Invalid whitelist structure' };
	// }
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
