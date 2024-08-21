//------------------------------------------------------//
// extension/public/js/helperFunctions/api.js
import { showNotification } from '../domHandlers/notification.js';
import { navigateToPage } from '../domHandlers/navigation.js';
import { handleLogout } from '../helperFunctions/eventListeners.js';
import { populateAdminDropdown, populateWhitelistsDropdown, populateWhitelistUrls } from '../domHandlers/dropdown.js';

// Standard function to handle API requests
const sendMessageToBackground = message => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, response => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError.message);
			} else if (!response.success) {
				reject(response.message || 'Unknown error occurred.');
			} else {
				resolve(response);
			}
		});
	});
};
//---------------public----------------
// Register user
export const registerUser = (payload, callback) => {
	sendMessageToBackground({ message: 'register', payload })
		.then(response => {
			callback(response);
		})
		.catch(error => {
			console.log('Registration failed:' + error);
			callback({ success: false, message: error });
		});
};
// Fetch and populate admins dropdown
export const fetchAndPopulateAdmins = () => {
	chrome.runtime.sendMessage({ message: 'fetchAdmins' }, response => {
		if (response.success) {
			populateAdminDropdown(response.admins);
		} else {
			showNotification('Failed to load admin list. Please try again later.', false);
		}
	});
};
// Fetch and populate admin's whitelists dropdown
export const fetchAndPopulateAdminsWhitelists = adminName => {
	chrome.runtime.sendMessage({ message: 'fetchAdminsWhitelists', adminName }, response => {
		if (response.success) {
			populateWhitelistsDropdown(response.whitelists);
		} else {
			showNotification('Failed to load whitelists. Please try again later.', false);
		}
	});
};
// Login user
export const loginUser = (email, password, callback) => {
	const payload = { email, password };
	sendMessageToBackground({ message: 'login', payload })
		.then(response => {
			callback(response);
		})
		.catch(error => {
			console.log('Login failed:' + error);
			callback({ success: false, message: error });
		});
};
//^----------WITH TOKEN ACTIONS - PRIVATE--------------------
// Retrieves subscribedWhitelistId from chrome storage
export const fetchSubscribedWhitelistId = callback => {
	chrome.storage.local.get('subscribedWhitelistId', result => {
		if (result.subscribedWhitelistId) {
			callback(result.subscribedWhitelistId); // Pass the ID to the callback
		} else {
			console.log('No subscribedWhitelistId found in storage');
			callback(null); // Handle missing ID case
		}
	});
};
// Get user's subscribed whitelist from local storage
export const getUserSubscribedWhitelist = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('subscribedWhitelist', result => {
			if (result.subscribedWhitelist) {
				resolve(result.subscribedWhitelist);
			} else {
				const errorMsg = 'Subscribed whitelist not found in storage';
				console.log(errorMsg);
				reject(errorMsg);
			}
		});
	});
};
// Fetch the subscribed whitelist URLs and populate them into the UI
export const fetchAndPopulateWhitelistUrls = async subscribedWhitelistId => {
	try {
		// Send message to the background to fetch the URLs
		const response = await sendMessageToBackground({
			message: 'fetchSubscribedWhitelist',
			subscribedWhitelistId: subscribedWhitelistId
		});

		// Handle success
		if (response.success) {
			const urls = response.monitoredSites || [];
			populateWhitelistUrls(urls); // Populate the URLs into the UI
			return urls;
		} else {
			// If JWT expired or any other error
			if (response.message === 'jwt expired' || response.statusCode === 403) {
				showNotification('Session expired. Logging out...', false);
				handleLogout(); // Perform the logout operation
				navigateToPage('mainPage'); // Redirect to the main page (or login)
			} else {
				showNotification('Failed to fetch monitored sites.', false);
			}
			return [];
		}
	} catch (error) {
		console.log('Failed to fetch monitored sites:', error);
		showNotification('Failed to fetch monitored sites.', false);
		return [];
	}
};

export const checkCertificate = async (canonicalUrl, formattedSubmittedURL) => {
	try {
		// Send message to the background to fetch the URLs
		const response = await sendMessageToBackground({
			message: 'checkCertificate',
			payload: { whitelistUrl: canonicalUrl, submittedUrl: formattedSubmittedURL }
		});
		showNotification(response.message, response.success);
	} catch (error) {
		console.log('Failed to checkCertificate:', error);
		showNotification('Failed to checkCertificate.', false);
		return [];
	}
};

export const checkUrl = async formattedSubmittedURL => {
	try {
		// Send message to the background to fetch the URLs
		const response = await sendMessageToBackground({
			message: 'checkUrl',
			payload: { url: formattedSubmittedURL }
		});
		showNotification(response.message, response.success);
	} catch (error) {
		console.log('Failed to checkUrl:', error);
		showNotification('Failed to checkUrl.', false);
	}
};
